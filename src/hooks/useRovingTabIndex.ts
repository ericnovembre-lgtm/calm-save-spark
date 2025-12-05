import { useState, useCallback, useRef, KeyboardEvent } from 'react';

type Orientation = 'horizontal' | 'vertical' | 'grid';

interface RovingTabIndexOptions<T> {
  items: T[];
  orientation?: Orientation;
  wrap?: boolean;
  columns?: number; // For grid orientation
  onSelect?: (item: T, index: number) => void;
  initialIndex?: number;
}

interface ItemProps {
  tabIndex: number;
  onKeyDown: (e: KeyboardEvent) => void;
  onFocus: () => void;
  ref: (el: HTMLElement | null) => void;
  'aria-selected'?: boolean;
  role?: string;
}

/**
 * Hook for keyboard navigation in lists, menus, and grids
 * Implements roving tabindex pattern for accessibility
 */
export function useRovingTabIndex<T>(options: RovingTabIndexOptions<T>) {
  const {
    items,
    orientation = 'vertical',
    wrap = true,
    columns = 1,
    onSelect,
    initialIndex = 0,
  } = options;

  const [focusedIndex, setFocusedIndex] = useState(initialIndex);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  const focusItem = useCallback((index: number) => {
    const element = itemRefs.current.get(index);
    if (element) {
      element.focus();
    }
  }, []);

  const getNextIndex = useCallback(
    (currentIndex: number, direction: 'next' | 'prev' | 'up' | 'down') => {
      const total = items.length;
      if (total === 0) return currentIndex;

      let nextIndex = currentIndex;

      if (orientation === 'grid') {
        switch (direction) {
          case 'next':
            nextIndex = currentIndex + 1;
            break;
          case 'prev':
            nextIndex = currentIndex - 1;
            break;
          case 'down':
            nextIndex = currentIndex + columns;
            break;
          case 'up':
            nextIndex = currentIndex - columns;
            break;
        }
      } else {
        switch (direction) {
          case 'next':
          case 'down':
            nextIndex = currentIndex + 1;
            break;
          case 'prev':
          case 'up':
            nextIndex = currentIndex - 1;
            break;
        }
      }

      if (wrap) {
        if (nextIndex < 0) nextIndex = total - 1;
        if (nextIndex >= total) nextIndex = 0;
      } else {
        nextIndex = Math.max(0, Math.min(total - 1, nextIndex));
      }

      return nextIndex;
    },
    [items.length, orientation, columns, wrap]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, index: number) => {
      let direction: 'next' | 'prev' | 'up' | 'down' | null = null;

      switch (e.key) {
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'grid') {
            direction = 'next';
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'grid') {
            direction = 'prev';
          }
          break;
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'grid') {
            direction = 'down';
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'grid') {
            direction = 'up';
          }
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          focusItem(0);
          return;
        case 'End':
          e.preventDefault();
          const lastIndex = items.length - 1;
          setFocusedIndex(lastIndex);
          focusItem(lastIndex);
          return;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect?.(items[index], index);
          return;
      }

      if (direction) {
        e.preventDefault();
        const nextIndex = getNextIndex(index, direction);
        setFocusedIndex(nextIndex);
        focusItem(nextIndex);
      }
    },
    [orientation, items, getNextIndex, focusItem, onSelect]
  );

  const getItemProps = useCallback(
    (index: number): ItemProps => ({
      tabIndex: index === focusedIndex ? 0 : -1,
      onKeyDown: (e: KeyboardEvent) => handleKeyDown(e, index),
      onFocus: () => setFocusedIndex(index),
      ref: (el: HTMLElement | null) => {
        if (el) {
          itemRefs.current.set(index, el);
        } else {
          itemRefs.current.delete(index);
        }
      },
      'aria-selected': index === focusedIndex,
    }),
    [focusedIndex, handleKeyDown]
  );

  const reset = useCallback(() => {
    setFocusedIndex(initialIndex);
  }, [initialIndex]);

  return {
    focusedIndex,
    setFocusedIndex,
    getItemProps,
    focusItem,
    reset,
  };
}
