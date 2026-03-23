# Performance Analysis — InvincibleVoice

> **Scope**: Read-only analysis. No source files were modified.
> All line numbers refer to the state of the code at the time this document was written.

---

## Table of Contents

1. [Frontend — React / Next.js](#1-frontend--react--nextjs)
   - 1.1 [Monolithic Component & State Cascade](#11-monolithic-component--state-cascade)
   - 1.2 [Missing Memoisation](#12-missing-memoisation)
   - 1.3 [TTS Cache Eviction (O(n) per eviction)](#13-tts-cache-eviction-on-per-eviction)
   - 1.4 [Audio Processor Worker Instantiation](#14-audio-processor-worker-instantiation)
   - 1.5 [DOM Query for Keyboard Shortcuts](#15-dom-query-for-keyboard-shortcuts)
2. [Backend — FastAPI / Python](#2-backend--fastapi--python)
   - 2.1 [Bug: Unformatted f-string in Prompt Builder](#21-bug-unformatted-f-string-in-prompt-builder)
   - 2.2 [String Concatenation in Hot Loop](#22-string-concatenation-in-hot-loop)
   - 2.3 [`_get_available_voices` Called Twice Per Request](#23-_get_available_voices-called-twice-per-request)
   - 2.4 [Per-Request HTTP Client Construction](#24-per-request-http-client-construction)
   - 2.5 [Artificial sleep() in Audio Chunking Loop](#25-artificial-sleep-in-audio-chunking-loop)
3. [Priority Matrix](#3-priority-matrix)
4. [Proposed Fixes (code-level)](#4-proposed-fixes-code-level)

---

## 1. Frontend — React / Next.js

### 1.1 Monolithic Component & State Cascade

**File**: `services/frontend/src/components/InvincibleVoice.tsx`

`InvincibleVoice` is a single component of **≈ 1 377 lines** that owns **≥ 20 `useState` calls** at its top level.
Every time any one of those state atoms changes, React re-renders the entire tree rooted at `InvincibleVoice`.

Several hot-path functions trigger **multiple consecutive `setState` calls**:

| Caller | setState calls in sequence | Effect |
|---|---|---|
| `handleSendMessage` (lines 671–707) | `setRawChatHistory` → `setTextInput` → `setLastSentText` → `clearResponses` | 4 synchronous render cycles |
| `handleInComingMessage` (lines 356–426) | up to 5 consecutive `set*` calls per incoming WebSocket frame | continuous render pressure |
| `handleResponseSelected` (lines 196–250) | `setResponseTimelines` + `setPendingResponses` then `setKeywordTimelines` + `setPendingKeywords` | 4 renders per selection |

In React 18+ most of these are automatically batched when they originate inside event handlers, but **calls inside `async` callbacks and WebSocket `onmessage` handlers** are only batched if explicitly wrapped in `unstable_batchedUpdates` (React 17) or by using a reducer.

**Proposed fix**: consolidate related atoms into a single `useReducer` (or Zustand/Jotai store) so that a single dispatch produces a single render. Additionally, split the component into smaller sub-components (e.g. `<ChatPanel>`, `<ResponseOptionsPanel>`, `<KeywordsPanel>`, `<SettingsPanel>`) each memoised with `React.memo`.

---

### 1.2 Missing Memoisation

**Files**: `InvincibleVoice.tsx`, `KeywordsSuggestion.tsx`, `ResponseOptions.tsx`

None of the following components are wrapped in `React.memo`:

| Component | File | Notes |
|---|---|---|
| `InvincibleVoice` | InvincibleVoice.tsx:67 | Root; exported as default — wrapping is not meaningful here, but splitting is |
| `KeywordsSuggestion` | KeywordsSuggestion.tsx:20 | Re-renders on every parent update |
| `MobileKeyword` | KeywordsSuggestion.tsx:118 | Inner list item, re-renders with every keystroke |
| `DesktopKeyword` | KeywordsSuggestion.tsx:162 | Same |
| `BaseResponseOption` | ResponseOptions.tsx:334 | Complex button, re-renders on every pending-response change |
| `EditingResponseOption` | ResponseOptions.tsx:265 | Textarea, expensive to re-render |

Additionally, `keywordTimelines` is initialised as `Array(10).fill(0)` **inline inside `useState`** (line 84–86).
Because the initial value expression is evaluated on every render call by JavaScript before React can discard it (React only uses the value on the first render), this is a minor but unnecessary allocation on every re-render.

**Proposed fix**:
```tsx
// Move outside the component
const INITIAL_KEYWORD_TIMELINES = Array<number>(10).fill(0);

// Inside the component
const [keywordTimelines, setKeywordTimelines] = useState<number[]>(INITIAL_KEYWORD_TIMELINES);
```

Wrap child components that receive stable props with `React.memo` and guard their callbacks with `useCallback`.

---

### 1.3 TTS Cache Eviction (O(n) per eviction)

**File**: `services/frontend/src/utils/ttsCache.ts`, lines 71–83

```ts
private getOldestTemporaryCacheKey(): string | null {
  let oldestKey: string | null = null;
  let oldestTimestamp = Infinity;

  for (const [key, entry] of this.temporaryCache.entries()) {  // O(n) scan
    if (entry.timestamp < oldestTimestamp) {
      oldestTimestamp = entry.timestamp;
      oldestKey = key;
    }
  }
  return oldestKey;
}
```

Every time the cache is full (size = 10) and a new entry must be added, the entire map is scanned to find the oldest entry. With a fixed cap of 10 entries the absolute cost is negligible today, but the algorithm is incorrect for a *true* LRU: it tracks **insertion time**, not **last-access time**. A cache hit (line 24) does not update the timestamp, so a frequently-accessed entry can be evicted before an entry that was inserted more recently but never re-read.

**Proposed fix**: replace the timestamp-based scan with a proper **doubly-linked-list + hash-map LRU**. Because `Map` preserves insertion order in JavaScript, a zero-dependency implementation is straightforward:

```ts
// On cache hit: delete and re-insert to move to "most recent" position
private get(text: string): CacheEntry | undefined {
  const entry = this.temporaryCache.get(text);
  if (entry) {
    this.temporaryCache.delete(text);   // remove from current position
    this.temporaryCache.set(text, entry); // re-insert at end (= most recent)
  }
  return entry;
}

// On eviction: delete the first (= oldest) key
private evictOldest(): void {
  const firstKey = this.temporaryCache.keys().next().value;
  if (firstKey !== undefined) this.temporaryCache.delete(firstKey);
}
```

This makes both hit and eviction O(1).

---

### 1.4 Audio Processor Worker Instantiation

**File**: `services/frontend/src/hooks/useAudioProcessor.ts`, line 56

```ts
const worker = new Worker('/decoderWorker.min.js');
```

A new `Worker` object is created on every invocation of the hook. Workers are OS threads — creating and destroying them repeatedly is expensive and can cause latency spikes on low-end devices.

**Proposed fix**: create the worker once (lazy singleton or `useRef`) and reuse it across recordings:

```ts
const workerRef = useRef<Worker | null>(null);
if (!workerRef.current) {
  workerRef.current = new Worker('/decoderWorker.min.js');
}
```

Terminate it only when the component unmounts.

---

### 1.5 DOM Query for Keyboard Shortcuts

**File**: `services/frontend/src/components/InvincibleVoice.tsx`, lines 923–934

```ts
const elements = document.querySelectorAll('[data-response-index]');
```

A live DOM query is executed inside a `keydown` event handler that fires on every key press. `querySelectorAll` forces a full sub-tree traversal.

**Proposed fix**: store element refs in a `useRef` array and pass them via props or context to the child components that render the response buttons, eliminating the DOM walk entirely.

---

## 2. Backend — FastAPI / Python

### 2.1 Bug: Unformatted f-string in Prompt Builder

**File**: `services/backend/backend/storage.py`, line 59

```python
prompt += "{document.content}\n\n"   # ← missing 'f' prefix
```

This line is missing the `f` prefix. As a result, the **literal string `{document.content}`** is appended to every LLM prompt instead of the actual document content. This is a **correctness bug** that also inflates the prompt with useless text, wasting tokens on every LLM call.

**Proposed fix**:
```python
prompt += f"{document.content}\n\n"
```

---

### 2.2 String Concatenation in Hot Loop

**File**: `services/backend/backend/storage.py`, lines 47–97

The system prompt is built by repeated `prompt += ...` across approximately 50 concatenation operations, including inside nested loops (conversations × messages). CPython's string interning optimisations help in simple cases, but this pattern still creates many intermediate string objects when the conversation history is long.

**Proposed fix**: accumulate parts in a list and join at the end:

```python
parts: list[str] = [BASE_SYSTEM_PROMPT, "\n\n"]
parts.append(f"## User's name\nThe user is {self.user_settings.name}.\n\n")
# ... all other sections ...
for message in conversation.messages:
    if isinstance(message, SpeakerMessage):
        parts.append(f"* Speaker: {message.content.strip()}\n")
    else:
        parts.append(f"* {self.user_settings.name} says: {message.content.strip()}\n")

prompt = "".join(parts)
```

This reduces allocations from O(n²) to O(n) where n is the number of string fragments.

---

### 2.3 `_get_available_voices` Called Twice Per Request

**File**: `services/backend/backend/routes/tts.py`, lines 43–58

When a TTS request arrives:
- line 44 fetches the voice list if `request.voice_name` is provided, **and**
- line 52 fetches the voice list *again* if `user.user_settings.voice` is set.

Both branches are mutually exclusive in practice, but the function is called a second time in the `elif` branch through an independent code path, making the logic hard to follow and risking two network/database round-trips if the conditions are ever both truthy due to a future refactoring.

**Proposed fix**: call the function once, lazily:

```python
_voices: dict | None = None

async def get_voices() -> dict:
    nonlocal _voices
    if _voices is None:
        _voices = await _get_available_voices(user.email)
    return _voices

if request.voice_name is not None:
    list_of_voices = await get_voices()
    ...
elif user.user_settings.voice:
    available_voices = await get_voices()
    ...
```

---

### 2.4 Per-Request HTTP Client Construction

**File**: `services/backend/backend/routes/tts.py`, line 103

```python
async with httpx.AsyncClient() as client:
    response = await client.post(TTS_SERVER, ...)
```

A new `httpx.AsyncClient` is created and destroyed for every TTS request. This means:
- A new TCP connection (and TLS handshake) is established each time.
- Connection pooling and keep-alive are bypassed entirely.

**Proposed fix**: create a module-level singleton client with a connection pool:

```python
# At module level
_http_client: httpx.AsyncClient | None = None

def get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(
            limits=httpx.Limits(max_keepalive_connections=10, max_connections=20),
            timeout=30.0,
        )
    return _http_client
```

Register a shutdown handler in the FastAPI lifespan to close the client gracefully.

---

### 2.5 Artificial `sleep()` in Audio Chunking Loop

**File**: `services/backend/backend/stt/speech_to_text.py`, lines 196–205

```python
for i in range(0, len(audio), chunk_size):
    chunk = audio[i : i + chunk_size]
    chunk_base64 = self.audio_to_base64_pcm(chunk)
    audio_msg = GradiumAudioMessage(audio=chunk_base64)
    await self._send(audio_msg)
    await asyncio.sleep(0.005)   # ← 5 ms added per chunk
```

A 5 ms sleep is injected between every 80 ms audio chunk to avoid overwhelming the Gradium STT service. For a 1-second audio segment this results in **≈ 60 ms of added latency** (12 chunks × 5 ms). For longer utterances the cumulative delay grows linearly.

**Proposed fix**: rely on the TCP/WebSocket back-pressure mechanism instead of an artificial delay. If the remote service requires throttling, use an adaptive approach (e.g. track RTT and only sleep when the send queue exceeds a threshold). At minimum, make `chunk_size` and the sleep duration configurable constants rather than magic numbers:

```python
STT_GRADIUM_CHUNK_SIZE = 1920          # 80 ms at 24 kHz
STT_GRADIUM_INTER_CHUNK_SLEEP = 0.0   # remove artificial delay; rely on backpressure
```

---

## 3. Priority Matrix

| # | Severity | File | Lines | Issue | Impact |
|---|---|---|---|---|---|
| 1 | 🔴 **Critical (Bug)** | `storage.py` | 59 | Unformatted f-string — document content never inserted into prompt | Wrong LLM answers, wasted tokens |
| 2 | 🟠 **High** | `InvincibleVoice.tsx` | 67–125, 356–705 | Monolithic component, state cascade re-renders | UI jank, sluggish responses panel |
| 3 | 🟠 **High** | `routes/tts.py` | 103 | Per-request HTTP client — no connection pooling | +50–200 ms TTS latency per request |
| 4 | 🟡 **Medium** | `ttsCache.ts` | 52–83 | Incorrect LRU (timestamp, not access-order); O(n) eviction | Wrong evictions, minor CPU waste |
| 5 | 🟡 **Medium** | `storage.py` | 47–97 | String concatenation in loop | Excess allocations on long histories |
| 6 | 🟡 **Medium** | `routes/tts.py` | 43–58 | `_get_available_voices` potentially called twice | Unnecessary network round-trip |
| 7 | 🟡 **Medium** | `useAudioProcessor.ts` | 56 | Worker created on every hook call | Thread churn, latency spikes |
| 8 | 🟢 **Low** | `speech_to_text.py` | 205 | Artificial 5 ms sleep per audio chunk | +60 ms per second of audio |
| 9 | 🟢 **Low** | `KeywordsSuggestion.tsx` | 20, 118, 162 | Missing `React.memo` on inner list items | Unnecessary re-renders |
| 10 | 🟢 **Low** | `ResponseOptions.tsx` | 265, 334 | Missing `React.memo` on response buttons | Unnecessary re-renders |
| 11 | 🟢 **Low** | `InvincibleVoice.tsx` | 923–934 | `querySelectorAll` on every keydown | DOM scan on every keystroke |
| 12 | 🟢 **Low** | `InvincibleVoice.tsx` | 84–86 | `Array(10).fill(0)` inline in `useState` | Minor allocation per render |

---

## 4. Proposed Fixes (code-level)

The concrete one-line or few-line patches for each issue are given inline in the sections above.
A suggested implementation order based on risk/reward:

1. **Fix item #1 (f-string bug)** — one character change, zero risk, immediate correctness gain.
2. **Fix item #3 (HTTP client pool)** — module-level singleton, contained change, high latency gain.
3. **Fix item #6 (voice fetch dedup)** — local refactor within a single function, low risk.
4. **Fix item #5 (join-based prompt builder)** — rewrite one function, improves clarity and performance.
5. **Fix item #4 (LRU cache)** — rewrite `ttsCache.ts`, good existing test coverage to validate.
6. **Fix item #7 (worker ref)** — one-line change to `useAudioProcessor.ts`.
7. **Fix item #8 (remove sleep)** — remove or make configurable; validate with Gradium staging.
8. **Fix items #9–#12 (memoisation, DOM)** — incremental; add `React.memo` + `useCallback` as child components are split out.
9. **Fix item #2 (component split)** — largest change, lowest risk per commit if done incrementally.
