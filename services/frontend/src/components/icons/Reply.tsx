import { ComponentProps } from 'react';

const Reply = ({ ...props }: ComponentProps<'svg'>) => {
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
        d='M10 2h4.2a8 8 0 0 1 8 8v4.2a8 8 0 0 1-8 8H10a8 8 0 0 1-8-8V10a8 8 0 0 1 8-8Zm6.4 10c.7-.6 1.1-1.5 1.1-2.5V8.3a.7.7 0 1 0-1.5 0v1.2a2.1 2.1 0 0 1-2.1 2.2H9.3l2.2-2.3a.7.7 0 0 0-1-1l-3.6 3.5-.1.2v.6l.1.2 3.5 3.5.6.2c.2 0 .3 0 .5-.2.3-.3.3-.8 0-1L9.3 13h4.6c1 0 1.9-.3 2.5-1Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default Reply;
