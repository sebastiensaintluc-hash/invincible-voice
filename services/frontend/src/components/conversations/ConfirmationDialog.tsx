import { X } from 'lucide-react';
import { FC, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}) => {
  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onClose, onConfirm]);

  if (!isOpen) {
    return null;
  }

  const dialogContent = (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold text-white'>{title}</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors'
            aria-label='Close'
          >
            <X size={20} />
          </button>
        </div>

        <p className='text-gray-300 mb-6'>{message}</p>

        <div className='flex gap-3 justify-end'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-300 hover:text-white transition-colors'
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors'
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
};

export default ConfirmationDialog;
