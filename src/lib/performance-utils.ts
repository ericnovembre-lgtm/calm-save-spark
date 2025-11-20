import { memo, useMemo, useCallback, ComponentType } from 'react';

/**
 * Performance utilities for memoization across all pages
 */

/**
 * Higher-order component for memoizing entire page components
 * Usage: export default withPageMemo(MyPage);
 */
export function withPageMemo<P extends object>(
  Component: ComponentType<P>,
  displayName?: string
) {
  const MemoizedComponent = memo(Component);
  MemoizedComponent.displayName = displayName || Component.displayName || Component.name;
  return MemoizedComponent;
}

/**
 * Typed wrapper around useMemo for page-level expensive calculations
 * Usage: const data = usePageMemo(() => expensiveCalculation(deps), [deps]);
 */
export function usePageMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

/**
 * Typed wrapper around useCallback for page-level event handlers
 * Usage: const handler = usePageCallback(() => doSomething(), [deps]);
 */
export function usePageCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * Debounce function for expensive operations
 * Usage: const debouncedSearch = debounce((value) => search(value), 300);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for high-frequency events (scroll, resize)
 * Usage: const throttledHandler = throttle((event) => handle(event), 100);
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Calculate array of items efficiently with memoization
 */
export function memoizeArray<T>(
  items: T[],
  deps: React.DependencyList
): T[] {
  return useMemo(() => items, deps);
}

/**
 * Memoize object properties to prevent reference changes
 */
export function memoizeObject<T extends object>(
  obj: T,
  deps: React.DependencyList
): T {
  return useMemo(() => obj, deps);
}
