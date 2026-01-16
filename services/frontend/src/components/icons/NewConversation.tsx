import { ComponentProps } from 'react';

const NewConversation = ({ ...props }: ComponentProps<'svg'>) => {
  return (
    <svg
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      <path
        d='M18 11c-.4 4-4.3 7.2-8.3 7.2H4a1.4 1.4 0 0 1-1.2-2l.2-.5c.2-.4.2-1 0-1.3A8.2 8.2 0 1 1 18 11Z'
        fill='currentColor'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M15.9 5.3a8.4 8.4 0 0 0-8 2.6 8.2 8.2 0 0 0-2 6.6c.5 4 4.4 7.1 8.4 7.1H20a1.4 1.4 0 0 0 1.2-2L21 19c-.3-.4-.3-1 0-1.3a8.2 8.2 0 0 0-5.1-12.5Zm-1.6 15a7.3 7.3 0 0 1-7-6c-.4-2 .2-4 1.6-5.5a7 7 0 0 1 11 8.3c-.4.8-.5 1.8 0 2.6l.2.5v.1h-5.8Z'
        fill='currentColor'
      />
      <path
        d='M12.2 9.2h-1.4V7.8a.8.8 0 0 0-1.6 0v1.4H7.8a.8.8 0 1 0 0 1.6h1.4v1.4a.8.8 0 1 0 1.6 0v-1.4h1.4a.8.8 0 1 0 0-1.6Z'
        fill='black'
      />
    </svg>
  );
};

export default NewConversation;
