import { FC, useMemo } from 'react';
import { cn } from '@/utils/cn';

export type HealthStatus = {
  connected: 'no' | 'yes_request_ok' | 'yes_request_fail';
  ok: boolean;
  tts_up?: boolean;
  stt_up?: boolean;
  llm_up?: boolean;
};

interface RenderServiceStatusProps {
  name: string;
  status: string | boolean | undefined;
}

const RenderServiceStatus: FC<RenderServiceStatusProps> = ({
  name,
  status,
}) => {
  const displayedStatus = useMemo(() => {
    if (status === undefined) {
      return 'Unknown';
    }
    if (status === true) {
      return 'Up';
    }
    if (status === false) {
      return 'Down';
    }
    return status;
  }, [status]);

  return (
    <p>
      {name}:{' '}
      <span
        className={cn({
          'text-white': displayedStatus === 'Up',
          'text-red': displayedStatus !== 'Up',
        })}
      >
        {displayedStatus}
      </span>
    </p>
  );
};

interface CouldNotConnectProps {
  healthStatus: HealthStatus;
}

const humanReadableStatus = {
  no: 'Down',
  yes_request_ok: 'Up',
  yes_request_fail: 'Up, but with errors',
};

const CouldNotConnect: FC<CouldNotConnectProps> = ({ healthStatus }) => {
  if (healthStatus.ok) {
    return null;
  }

  return (
    <div className='w-full h-full flex flex-col gap-12 items-center justify-center bg-background'>
      <div className='text-center text-xl'>
        <h1 className='text-3xl mb-4'>Couldn&apos;t connect :(</h1>
        <p>Service status:</p>
        <RenderServiceStatus
          name='Backend'
          status={humanReadableStatus[healthStatus.connected]}
        />
        <RenderServiceStatus
          name='STT'
          status={healthStatus.stt_up}
        />
        <RenderServiceStatus
          name='LLM'
          status={healthStatus.llm_up}
        />
        <RenderServiceStatus
          name='TTS'
          status={healthStatus.tts_up}
        />
      </div>
    </div>
  );
};

export default CouldNotConnect;
