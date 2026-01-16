import { ComponentProps } from 'react';

const Unlock = ({ ...props }: ComponentProps<'svg'>) => {
  return (
    <svg
      viewBox='0 0 16 16'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.7 5.2h4a3.2 3.2 0 0 1 3.4 3.5l-.7 3.9a3.2 3.2 0 0 1-3.2 2.6H6.6c-1.6 0-3-1-3.3-2.6l-.6-3.9a3 3 0 0 1 2-3.3v-2a2 2 0 0 1 2-2H9a2 2 0 0 1 2 2 .5.5 0 0 1-1 0c0-.6-.5-1-1-1H6.8a1 1 0 0 0-1.1 1v1.8Zm3 5.8-.2-.4c0-.2 0-.5.2-.6A1.1 1.1 0 1 0 7 10c.2.1.2.4.1.6v.4a.6.6 0 0 0 .5.9H8a.6.6 0 0 0 .6-.9Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default Unlock;
