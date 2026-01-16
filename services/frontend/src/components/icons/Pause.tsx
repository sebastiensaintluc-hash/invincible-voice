import { ComponentProps } from 'react';

const Pause = ({ ...props }: ComponentProps<'svg'>) => {
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
        d='M10.7 1.3H5.3a4 4 0 0 0-4 4v5.4a4 4 0 0 0 4 4h5.4a4 4 0 0 0 4-4V5.3a4 4 0 0 0-4-4ZM7 10a.7.7 0 1 1-1.3 0V6A.7.7 0 1 1 7 6v4Zm2.7.7c.3 0 .6-.3.6-.7V6A.7.7 0 0 0 9 6v4c0 .4.3.7.7.7Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default Pause;
