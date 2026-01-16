import { ComponentProps } from 'react';

const Plus = ({ ...props }: ComponentProps<'svg'>) => {
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
        d='M4 1.3h8c1.5 0 2.7 1.2 2.7 2.7v8c0 1.5-1.2 2.7-2.7 2.7H4A2.7 2.7 0 0 1 1.3 12V4c0-1.5 1.2-2.7 2.7-2.7Zm4.5 7.2h2.2a.5.5 0 0 0 0-1H8.5V5.3a.5.5 0 0 0-1 0v2.2H5.3a.5.5 0 0 0 0 1h2.2v2.2a.5.5 0 0 0 1 0V8.5Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default Plus;
