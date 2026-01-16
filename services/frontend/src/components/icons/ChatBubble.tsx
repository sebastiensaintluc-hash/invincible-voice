import { ComponentProps } from 'react';

const ChatBubble = ({ ...props }: ComponentProps<'svg'>) => {
  return (
    <svg
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M6.4 2h11.2C20 2 22 4.2 22 6.7v6.6a4.6 4.6 0 0 1-4.5 4.7H8c-.7 0-1.3.3-1.7.8l-2.4 2.5a1 1 0 0 1-.8.4A1.1 1.1 0 0 1 2 20.5V6.7C2 4.2 4 2.1 6.4 2Zm11.2 14.5a3 3 0 0 0 2.9-3.2V6.7c0-1.7-1.2-3.1-3-3.2h-11c-1.8 0-3 1.5-3 3.2v12.8l1.6-1.7A4 4 0 0 1 8 16.5h9.6Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default ChatBubble;
