'use client';

import { FC, Fragment } from 'react';

interface WriterMessageProps {
  content: string;
  onClick?: () => void;
  isClickable?: boolean;
}

const WriterMessage: FC<WriterMessageProps> = ({
  content,
  onClick = undefined,
  isClickable = false,
}) => {
  return (
    <Fragment>
      {isClickable && content.trim() && (
        <button
          className='flex self-end max-w-[70%] w-auto bg-[#39F2AE] border border-[#2EE76F] px-6 py-3 rounded-b-3xl rounded-tl-3xl rounded-tr-sm text-base font-medium text-black leading-relaxed whitespace-pre-wrap cursor-pointer hover:bg-[#39F2AECC] transition-colors text-right'
          onClick={onClick}
          title='Click to play audio'
        >
          {content}
        </button>
      )}
      {!isClickable && content.trim() && (
        <div className='flex self-end max-w-[70%] w-auto bg-[#39F2AE] border border-[#2EE76F] px-6 py-3 rounded-b-3xl rounded-tl-3xl rounded-tr-sm text-base font-medium text-black leading-relaxed whitespace-pre-wrap text-right'>
          {content}
        </div>
      )}
    </Fragment>
  );
};

export default WriterMessage;
