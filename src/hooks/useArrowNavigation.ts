import { useCallback, useState, useRef, useEffect } from 'react';
import { 
  getNextIndex, 
  typeAheadSearch,
  type Direction,
} from '@/lib/keyboard-navigation';

interface UseArrowNavigationOptions {
  /** Total number of items */
  itemCount: number;
  /** Navigation orientation */
  orientation?: 'horizontal' | 'vertical' | 'grid';
  /** Number of columns for grid orientation */
  columns?: number;
  /** Whether to wrap around at boundaries */
  wrap?: boolean;
  /** Initial focused index */
  initialIndex?: number;
  /** Callback when index changes */
  onIndexChange?: (index: number) => void;
  /** Enable type-ahead search */
  typeAhead?: boolean;
  /** Get label for item at index (for type-ahead) */
  getItemLabel?: (index: number) => string;
}

interface UseArrowNavigationReturn {
  /** Currently focused index */
  focusedIndex: number;
  /** Set focused index manually */
  setFocusedIndex: (index: number) => void;
  /** Get props for container element */
  getContainerProps: () => {
    onKeyDown: (e: React.KeyboardEvent) => void;
    role: string;
    'aria-activedescendant'?: string;
  };
  /** Get props for item at index */
  getItemProps: (index: number) => {
    id: string;
    tabIndex: number;
    'aria-selected': boolean;
    onFocus: () => void;
  };
  /** Move to next item */
  moveNext: () => void;
  /** Move to previous item */
  movePrevious: () => void;
  /** Move to first item */
  moveFirst: () => void;
  /** Move to last item */
  moveLast: () => void;
}

/**
 * Hook for arrow key navigation in lists, menus, and grids.
 * Supports horizontal, vertical, and grid orientations with type-ahead search.
 */
export function useArrowNavigation({
  itemCount,
  orientation = 'vertical',
  columns = 1,
  wrap = true,
  initialIndex = 0,
  onIndexChange,
  typeAhead = false,
  getItemLabel,
}: UseArrowNavigationOptions): UseArrowNavigationReturn {
  const [focusedIndex, setFocusedIndexState] = useState(initialIndex);
  const typeAheadBuffer = useRef('');
  const typeAheadTimeout = useRef<ReturnType<typeof setTimeout>>();
  const containerId = useRef(`nav-container-${Math.random().toString(36).slice(2, 9)}`);

  const setFocusedIndex = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(itemCount - 1, index));
    setFocusedIndexState(clampedIndex);
    onIndexChange?.(clampedIndex);
  }, [itemCount, onIndexChange]);

  const moveNext = useCallback(() => {
    const nextIndex = getNextIndex(focusedIndex, 'down', itemCount, { wrap });
    setFocusedIndex(nextIndex);
  }, [focusedIndex, itemCount, wrap, setFocusedIndex]);

  const movePrevious = useCallback(() => {
    const prevIndex = getNextIndex(focusedIndex, 'up', itemCount, { wrap });
    setFocusedIndex(prevIndex);
  }, [focusedIndex, itemCount, wrap, setFocusedIndex]);

  const moveFirst = useCallback(() => {
    setFocusedIndex(0);
  }, [setFocusedIndex]);

  const moveLast = useCallback(() => {
    setFocusedIndex(itemCount - 1);
  }, [itemCount, setFocusedIndex]);

  const moveUp = useCallback(() => {
    if (orientation === 'grid') {
      const newIndex = focusedIndex - columns;
      if (newIndex >= 0) {
        setFocusedIndex(newIndex);
      } else if (wrap) {
        // Wrap to same column in last row
        const lastRowStart = Math.floor((itemCount - 1) / columns) * columns;
        const targetIndex = Math.min(lastRowStart + (focusedIndex % columns), itemCount - 1);
        setFocusedIndex(targetIndex);
      }
    } else {
      movePrevious();
    }
  }, [orientation, columns, focusedIndex, itemCount, wrap, setFocusedIndex, movePrevious]);

  const moveDown = useCallback(() => {
    if (orientation === 'grid') {
      const newIndex = focusedIndex + columns;
      if (newIndex < itemCount) {
        setFocusedIndex(newIndex);
      } else if (wrap) {
        // Wrap to same column in first row
        setFocusedIndex(focusedIndex % columns);
      }
    } else {
      moveNext();
    }
  }, [orientation, columns, focusedIndex, itemCount, wrap, setFocusedIndex, moveNext]);

  const handleTypeAhead = useCallback((char: string) => {
    if (!typeAhead || !getItemLabel) return;

    // Clear previous timeout
    if (typeAheadTimeout.current) {
      clearTimeout(typeAheadTimeout.current);
    }

    // Add character to buffer
    typeAheadBuffer.current += char.toLowerCase();

    // Build items array with labels
    const labels = Array.from({ length: itemCount }, (_, i) => getItemLabel(i));

    // Find matching item
    const matchIndex = typeAheadSearch(labels, typeAheadBuffer.current, focusedIndex + 1);

    if (matchIndex !== -1) {
      setFocusedIndex(matchIndex);
    }

    // Clear buffer after delay
    typeAheadTimeout.current = setTimeout(() => {
      typeAheadBuffer.current = '';
    }, 500);
  }, [typeAhead, getItemLabel, itemCount, focusedIndex, setFocusedIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    let handled = false;

    switch (e.key) {
      case 'ArrowUp':
        if (orientation !== 'horizontal') {
          moveUp();
          handled = true;
        }
        break;
      case 'ArrowDown':
        if (orientation !== 'horizontal') {
          moveDown();
          handled = true;
        }
        break;
      case 'ArrowLeft':
        if (orientation !== 'vertical') {
          movePrevious();
          handled = true;
        }
        break;
      case 'ArrowRight':
        if (orientation !== 'vertical') {
          moveNext();
          handled = true;
        }
        break;
      case 'Home':
        moveFirst();
        handled = true;
        break;
      case 'End':
        moveLast();
        handled = true;
        break;
      default:
        // Handle type-ahead for single printable characters
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          handleTypeAhead(e.key);
          handled = true;
        }
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [orientation, moveUp, moveDown, movePrevious, moveNext, moveFirst, moveLast, handleTypeAhead]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typeAheadTimeout.current) {
        clearTimeout(typeAheadTimeout.current);
      }
    };
  }, []);

  const getContainerProps = useCallback(() => ({
    onKeyDown: handleKeyDown,
    role: orientation === 'grid' ? 'grid' : 'listbox',
    'aria-activedescendant': `${containerId.current}-item-${focusedIndex}`,
  }), [handleKeyDown, orientation, focusedIndex]);

  const getItemProps = useCallback((index: number) => ({
    id: `${containerId.current}-item-${index}`,
    tabIndex: index === focusedIndex ? 0 : -1,
    'aria-selected': index === focusedIndex,
    onFocus: () => setFocusedIndex(index),
  }), [focusedIndex, setFocusedIndex]);

  return {
    focusedIndex,
    setFocusedIndex,
    getContainerProps,
    getItemProps,
    moveNext,
    movePrevious,
    moveFirst,
    moveLast,
  };
}
