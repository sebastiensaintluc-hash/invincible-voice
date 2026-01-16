import { ComponentProps } from 'react';

const Lock = ({ ...props }: ComponentProps<'svg'>) => {
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
        d='M11 4.7v-2a2 2 0 0 0-2-2H6.8a2 2 0 0 0-2.1 2v2a3 3 0 0 0-2 3.4l.6 3.8a3.2 3.2 0 0 0 3.3 2.6h2.6c1.5 0 3-1 3.2-2.6l.7-3.8a3 3 0 0 0-2-3.4ZM8.5 10l.2.4a.6.6 0 0 1-.6.8h-.5a.6.6 0 0 1-.6-.8l.1-.4c.1-.3 0-.5-.1-.7a1.1 1.1 0 1 1 1.7 0c-.2.2-.2.4-.2.7ZM5.7 4.5H10V2.7c0-.6-.5-1-1-1H6.8a1 1 0 0 0-1.1 1v1.8Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default Lock;
