import { useEffect, useState } from 'react';

const ALLOW_DEV_MODE = true;

const useKeyboardShortcuts = () => {
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { activeElement } = document;
      // Don't toggle dev mode if the active element is an input field
      const isInputField =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true');

      if (
        ALLOW_DEV_MODE &&
        !isInputField &&
        (event.key === 'D' || event.key === 'd')
      ) {
        setIsDevMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsDevMode]);

  return { isDevMode };
};

export default useKeyboardShortcuts;
