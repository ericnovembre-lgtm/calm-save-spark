/**
 * Performance Memoization Utilities
 * Standardized memoization with custom comparison functions
 */
import { memo, ComponentType, FC } from 'react';

/**
 * Shallow equality comparison for objects
 */
export function shallowEqual<T extends Record<string, unknown>>(prev: T, next: T): boolean {
  if (prev === next) return true;
  if (!prev || !next) return false;
  
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  
  if (prevKeys.length !== nextKeys.length) return false;
  
  for (const key of prevKeys) {
    if (prev[key] !== next[key]) return false;
  }
  
  return true;
}

/**
 * Deep equality comparison (use sparingly - expensive)
 */
export function deepEqual<T>(prev: T, next: T): boolean {
  if (prev === next) return true;
  if (typeof prev !== typeof next) return false;
  if (prev === null || next === null) return prev === next;
  
  if (typeof prev !== 'object') return prev === next;
  
  if (Array.isArray(prev) && Array.isArray(next)) {
    if (prev.length !== next.length) return false;
    return prev.every((item, i) => deepEqual(item, next[i]));
  }
  
  if (Array.isArray(prev) !== Array.isArray(next)) return false;
  
  const prevObj = prev as Record<string, unknown>;
  const nextObj = next as Record<string, unknown>;
  const keys = Object.keys(prevObj);
  
  if (keys.length !== Object.keys(nextObj).length) return false;
  
  return keys.every(key => deepEqual(prevObj[key], nextObj[key]));
}

/**
 * Create a memoized component with custom comparison
 */
export function createMemoComponent<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prev: Readonly<P>, next: Readonly<P>) => boolean
) {
  const MemoizedComponent = memo(Component, propsAreEqual);
  MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name || 'Component'})`;
  return MemoizedComponent;
}

/**
 * Auto-memo for functional components with specific dependency props
 * Only re-renders when specified props change
 */
export function autoMemo<P extends object>(
  Component: FC<P>,
  deps?: (keyof P)[]
) {
  const propsAreEqual = deps 
    ? (prev: Readonly<P>, next: Readonly<P>) => {
        return deps.every(dep => prev[dep] === next[dep]);
      }
    : undefined;
  
  const MemoizedComponent = memo(Component, propsAreEqual);
  MemoizedComponent.displayName = `AutoMemo(${Component.displayName || Component.name || 'Component'})`;
  return MemoizedComponent;
}

/**
 * Memo wrapper that only compares primitive props
 * Useful for components receiving callbacks that change reference
 */
export function memoWithPrimitives<P extends object>(Component: FC<P>) {
  const MemoizedComponent = memo(Component, (prev, next) => {
    const prevKeys = Object.keys(prev) as (keyof P)[];
    const nextKeys = Object.keys(next) as (keyof P)[];
    
    if (prevKeys.length !== nextKeys.length) return false;
    
    return prevKeys.every(key => {
      const prevVal = prev[key];
      const nextVal = next[key];
      
      // Skip function comparison (assume stable callbacks)
      if (typeof prevVal === 'function' && typeof nextVal === 'function') {
        return true;
      }
      
      return prevVal === nextVal;
    });
  });
  
  MemoizedComponent.displayName = `MemoPrimitives(${Component.displayName || Component.name || 'Component'})`;
  return MemoizedComponent;
}

/**
 * Create comparison function for specific props
 */
export function createPropsComparator<P extends object>(
  ...keys: (keyof P)[]
): (prev: Readonly<P>, next: Readonly<P>) => boolean {
  return (prev, next) => keys.every(key => prev[key] === next[key]);
}
