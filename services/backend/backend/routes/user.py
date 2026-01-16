import logging
import datetime as dt
from fastapi import (
    HTTPException,
    WebSocket,
    status,
    APIRouter,
    Depends,
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


from backend import metrics as mt
from backend.timer import Stopwatch
from backend.typing import UserSettings
from backend.unmute_handler import UnmuteHandler
from backend.kyutai_constants import SEMAPHORE
from backend.security import decode_access_token
from backend.storage import UserData, get_user_data_from_storage
from backend.libs.websockets import report_websocket_exception, run_route

_current_profile = None

PROFILE_ACTIVE = False


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)


bearer_scheme = HTTPBearer()
user_router = APIRouter(prefix="/v1/user", tags=["User"])


def get_current_user_from_bearer(bearer: str) -> UserData:
    try:
        payload = decode_access_token(bearer)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = get_user_data_from_storage(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> UserData:
    return get_current_user_from_bearer(credentials.credentials)


@user_router.get("/")
def get_me(user: UserData = Depends(get_current_user)) -> UserData:
    return user


@user_router.post("/settings")
def update_user_settings(
    settings: UserSettings, user: UserData = Depends(get_current_user)
):
    user.user_settings = settings
    user.save()


@user_router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int, user: UserData = Depends(get_current_user)
):
    del user.conversations[conversation_id]
    user.save()


@user_router.websocket("/new-conversation")
async def websocket_route(
    websocket: WebSocket,
    local_time: dt.datetime,
):
    user = None
    for protocol in websocket.scope["subprotocols"]:
        if protocol.startswith("Bearer."):
            token = protocol.replace("Bearer.", "")
            user = get_current_user_from_bearer(token)
            break

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    logger.info("New WebSocket connection")
    if local_time.tzinfo is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="local_time must be timezone-aware",
        )
    global _last_profile, _current_profile
    mt.SESSIONS.inc()
    mt.ACTIVE_SESSIONS.inc()
    session_watch = Stopwatch()
    if PROFILE_ACTIVE and _current_profile is None:
        from pyinstrument import Profiler

        logger.info("Profiler started.")
        _current_profile = Profiler(interval=0.0001, async_mode="disabled")
        import inspect

        frame = inspect.currentframe()
        while frame is not None and frame.f_back:
            frame = frame.f_back
        _current_profile.start(caller_frame=frame)

    async with SEMAPHORE:
        try:
            # The `subprotocol` argument is important because the client specifies what
            # protocol(s) it supports and OpenAI uses "realtime" as the value. If we
            # don't set this, the client will think this is not the right endpoint and
            # will not connect.
            await websocket.accept(subprotocol="realtime")

            handler = UnmuteHandler(str(user.email), local_time)
            async with handler:
                await handler.start_up()
                await run_route(websocket, handler)

        except Exception as exc:
            await report_websocket_exception(websocket, exc)
        finally:
            if _current_profile is not None:
                _current_profile.stop()
                logger.info("Profiler saved.")
                _last_profile = _current_profile
                _current_profile = None

            mt.ACTIVE_SESSIONS.dec()
            mt.SESSION_DURATION.observe(session_watch.time())
