import { ComponentProps } from 'react';

const Edit = ({ ...props }: ComponentProps<'svg'>) => {
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
        d='m5.2 10.2.5-2.3c0-.3.2-.6.4-.8l4.5-4.4c.4-.5 1-.8 1.7-.8.5 0 1 .2 1.3.5.8 1 .7 2.3-.2 3L8.9 10l-.8.5-2.3.4h-.1a.5.5 0 0 1-.5-.6Zm1.6-2.4-.1.3-.4 1.6L8 9.3l.3-.1 4.5-4.5c.5-.4.6-1 .2-1.6a.8.8 0 0 0-.6-.2c-.4 0-.7.2-1 .4L6.8 7.8Z'
        fill='currentColor'
      />
      <path
        d='M13.3 7.3c-.3 0-.5.2-.5.5v3.8a2 2 0 0 1-2 2H4.4a2 2 0 0 1-2-2V5.3c0-1.2 1-2 2-2h3.8a.5.5 0 0 0 0-1H4.4a3 3 0 0 0-3 3v6.3a3 3 0 0 0 3 3h6.3a3 3 0 0 0 3-3V7.8c0-.3-.2-.5-.4-.5Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default Edit;
