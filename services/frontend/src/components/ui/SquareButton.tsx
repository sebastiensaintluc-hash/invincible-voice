import { FC } from 'react';
import { cn } from '@/utils/cn';

interface SquareButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  kind?: 'primary' | 'primaryOff' | 'secondary';
  extraClasses?: string;
  disabled?: boolean;
}

const SquareButton: FC<SquareButtonProps> = ({
  onClick = () => {},
  children,
  kind = 'primary',
  extraClasses = '',
  disabled = undefined,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-2 py-2 bg-black text-xs lg:text-sm cursor-pointer transition-colors duration-200 overflow-hidden text-nowrap border border-dashed',
        {
          'opacity-50 cursor-not-allowed': disabled,
          'text-green border-green': kind === 'primary',
          'text-white border-white': kind === 'primaryOff',
          'text-white border-transparent': kind === 'secondary',
        },
        extraClasses,
      )}
      style={{ filter: 'drop-shadow(0rem 0.2rem 0.15rem var(--darkgray))' }}
    >
      <span className='mx-[-100%] text-center'>{children}</span>
    </button>
  );
};

export default SquareButton;
