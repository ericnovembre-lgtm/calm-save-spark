/**
 * Keyboard Navigation Utilities
 * Shared utilities for keyboard navigation across the app
 */

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface KeyboardNavigationConfig {
  orientation?: 'horizontal' | 'vertical' | 'both';
  wrap?: boolean;
  homeEnd?: boolean;
  typeAhead?: boolean;
}

// Check if element is focusable
export function isFocusable(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;
  
  const tabIndex = element.tabIndex;
  const isDisabled = element.hasAttribute('disabled');
  const isHidden =
    element.getAttribute('aria-hidden') === 'true' ||
    window.getComputedStyle(element).display === 'none' ||
    window.getComputedStyle(element).visibility === 'hidden';

  return tabIndex >= 0 && !isDisabled && !isHidden;
}

// Get all focusable elements in a container
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  return Array.from(container.querySelectorAll(selectors.join(', '))).filter(
    (el) => isFocusable(el)
  ) as HTMLElement[];
}

// Get direction from key event
export function getDirectionFromKey(
  key: string,
  config: KeyboardNavigationConfig = {}
): Direction | null {
  const { orientation = 'both' } = config;

  const keyMap: Record<string, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  };

  const direction = keyMap[key];
  if (!direction) return null;

  if (orientation === 'horizontal' && (direction === 'up' || direction === 'down')) {
    return null;
  }
  if (orientation === 'vertical' && (direction === 'left' || direction === 'right')) {
    return null;
  }

  return direction;
}

// Calculate next index based on direction
export function getNextIndex(
  currentIndex: number,
  direction: Direction,
  total: number,
  config: KeyboardNavigationConfig = {}
): number {
  const { wrap = true } = config;

  let nextIndex = currentIndex;

  switch (direction) {
    case 'up':
    case 'left':
      nextIndex = currentIndex - 1;
      break;
    case 'down':
    case 'right':
      nextIndex = currentIndex + 1;
      break;
  }

  if (wrap) {
    if (nextIndex < 0) return total - 1;
    if (nextIndex >= total) return 0;
  } else {
    return Math.max(0, Math.min(total - 1, nextIndex));
  }

  return nextIndex;
}

// Handle Home/End keys
export function handleHomeEnd(
  key: string,
  total: number,
  config: KeyboardNavigationConfig = {}
): number | null {
  const { homeEnd = true } = config;
  if (!homeEnd) return null;

  if (key === 'Home') return 0;
  if (key === 'End') return total - 1;
  return null;
}

// Type-ahead search in list
export function typeAheadSearch(
  items: string[],
  query: string,
  startIndex: number = 0
): number {
  const normalizedQuery = query.toLowerCase();
  
  // Search from current position
  for (let i = startIndex; i < items.length; i++) {
    if (items[i].toLowerCase().startsWith(normalizedQuery)) {
      return i;
    }
  }
  
  // Wrap around
  for (let i = 0; i < startIndex; i++) {
    if (items[i].toLowerCase().startsWith(normalizedQuery)) {
      return i;
    }
  }

  return -1;
}

// Focus next element in direction
export function focusNextElement(
  container: HTMLElement,
  direction: Direction
): HTMLElement | null {
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return null;

  const currentIndex = focusable.findIndex(
    (el) => el === document.activeElement
  );
  
  if (currentIndex === -1) {
    focusable[0].focus();
    return focusable[0];
  }

  const nextIndex = getNextIndex(currentIndex, direction, focusable.length);
  focusable[nextIndex].focus();
  return focusable[nextIndex];
}

// Trap focus within container
export function trapFocus(
  event: KeyboardEvent,
  container: HTMLElement
): void {
  if (event.key !== 'Tab') return;

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return;

  const firstElement = focusable[0];
  const lastElement = focusable[focusable.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  } else {
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
}

// Keyboard shortcuts registry
const shortcuts = new Map<string, () => void>();

export function registerShortcut(key: string, callback: () => void): void {
  shortcuts.set(key.toLowerCase(), callback);
}

export function unregisterShortcut(key: string): void {
  shortcuts.delete(key.toLowerCase());
}

export function handleGlobalShortcut(event: KeyboardEvent): void {
  // Skip if in input field
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement
  ) {
    return;
  }

  const key = event.key.toLowerCase();
  const callback = shortcuts.get(key);
  
  if (callback) {
    event.preventDefault();
    callback();
  }
}

// Initialize global keyboard listener
let initialized = false;

export function initKeyboardNavigation(): () => void {
  if (initialized) return () => {};
  
  document.addEventListener('keydown', handleGlobalShortcut);
  initialized = true;

  return () => {
    document.removeEventListener('keydown', handleGlobalShortcut);
    initialized = false;
    shortcuts.clear();
  };
}
