import { ComponentProps } from 'react';

const Trash = ({ ...props }: ComponentProps<'svg'>) => {
  return (
    <svg
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      <path
        d='M12.5 4.7c-.3 0-.5.2-.5.5V11c0 1.2-1 2.2-2.2 2.2H6c-1.3 0-2.3-1-2.3-2.2V5a.5.5 0 0 0-1 0v6c0 1.8 1.5 3.3 3.3 3.3h3.8c1.8 0 3.3-1.5 3.3-3.3V5a.5.5 0 0 0-.6-.4Z'
        fill='currentColor'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12.5 3.7H3.2a.5.5 0 0 1 0-1H5l.7-.9c.3-.3.8-.5 1.2-.5h2c.4 0 .8.2 1 .5l.9.9h1.7a.5.5 0 1 1 0 1ZM8.8 2.4h-2l-.3.1-.1.2h3l-.2-.2a.5.5 0 0 0-.4-.1Z'
        fill='currentColor'
      />
      <path
        d='M5.4 5.9v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-1 0Zm2 0v5.3a.5.5 0 1 0 1 0V5.9a.5.5 0 0 0-1 0Zm2 0v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-1 0Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default Trash;
