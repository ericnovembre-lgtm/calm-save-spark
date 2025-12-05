import { useRef, useCallback, useEffect } from 'react';

interface FocusRestorationOptions {
  /** Automatically save focus when the component mounts */
  autoSave?: boolean;
  /** Automatically restore focus when the component unmounts */
  autoRestore?: boolean;
  /** Delay before restoring focus (useful for animations) */
  restoreDelay?: number;
}

/**
 * Hook for saving and restoring focus position
 * Useful for modals, drawers, and other overlay components
 */
export function useFocusRestoration(options: FocusRestorationOptions = {}) {
  const { autoSave = false, autoRestore = false, restoreDelay = 0 } = options;

  const savedElement = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    savedElement.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    const restore = () => {
      if (savedElement.current && document.body.contains(savedElement.current)) {
        savedElement.current.focus();
        savedElement.current = null;
      }
    };

    if (restoreDelay > 0) {
      setTimeout(restore, restoreDelay);
    } else {
      restore();
    }
  }, [restoreDelay]);

  const clearSavedFocus = useCallback(() => {
    savedElement.current = null;
  }, []);

  // Auto save on mount
  useEffect(() => {
    if (autoSave) {
      saveFocus();
    }
  }, [autoSave, saveFocus]);

  // Auto restore on unmount
  useEffect(() => {
    return () => {
      if (autoRestore && savedElement.current) {
        const element = savedElement.current;
        setTimeout(() => {
          if (document.body.contains(element)) {
            element.focus();
          }
        }, restoreDelay);
      }
    };
  }, [autoRestore, restoreDelay]);

  return {
    saveFocus,
    restoreFocus,
    clearSavedFocus,
    hasSavedFocus: savedElement.current !== null,
  };
}
