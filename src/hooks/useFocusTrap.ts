import { useEffect, useRef, useCallback, RefObject } from 'react';

interface FocusTrapOptions {
  enabled?: boolean;
  initialFocus?: 'first' | 'auto' | RefObject<HTMLElement>;
  returnFocusOnDeactivate?: boolean;
  escapeDeactivates?: boolean;
  onEscape?: () => void;
}

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: FocusTrapOptions = {}
) {
  const {
    enabled = true,
    initialFocus = 'first',
    returnFocusOnDeactivate = true,
    escapeDeactivates = true,
    onEscape,
  } = options;

  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter((el) => {
      // Filter out hidden elements
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }, []);

  const focusFirst = useCallback(() => {
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[focusable.length - 1].focus();
    }
  }, [getFocusableElements]);

  // Handle tab key to trap focus
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || !containerRef.current) return;

      if (event.key === 'Escape' && escapeDeactivates) {
        event.preventDefault();
        onEscape?.();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [enabled, escapeDeactivates, getFocusableElements, onEscape]
  );

  // Activate focus trap
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Set initial focus
    requestAnimationFrame(() => {
      if (!containerRef.current) return;

      if (initialFocus === 'first') {
        focusFirst();
      } else if (initialFocus === 'auto') {
        // Focus container if it's focusable, otherwise first element
        if (containerRef.current.tabIndex >= 0) {
          containerRef.current.focus();
        } else {
          focusFirst();
        }
      } else if (initialFocus && 'current' in initialFocus && initialFocus.current) {
        initialFocus.current.focus();
      }
    });

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Return focus on cleanup
      if (returnFocusOnDeactivate && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled, initialFocus, returnFocusOnDeactivate, focusFirst, handleKeyDown]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    getFocusableElements,
  };
}
