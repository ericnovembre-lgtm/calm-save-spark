/**
 * Dynamic Import Utilities
 * Standardized lazy imports with retry and preload
 */
import { lazy, ComponentType } from 'react';

/**
 * Lazy import with automatic retry on failure
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3,
  delay = 1000
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Import failed');
        
        // Don't retry on syntax errors or module not found
        if (lastError.message.includes('Failed to fetch') || 
            lastError.message.includes('Loading chunk')) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        } else {
          throw lastError;
        }
      }
    }
    
    throw lastError || new Error('Import failed after retries');
  });
}

/**
 * Preload a component before it's needed
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
): void {
  // Use requestIdleCallback if available
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => importFn(), { timeout: 2000 });
  } else {
    setTimeout(() => importFn(), 200);
  }
}

/**
 * Create a lazy component with preload capability
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> & { preload: () => Promise<void> } {
  const Component = lazy(importFn) as React.LazyExoticComponent<T> & { 
    preload: () => Promise<void> 
  };
  
  Component.preload = async () => {
    await importFn();
  };
  
  return Component;
}

/**
 * Batch preload multiple components
 */
export function preloadComponents(
  importFns: Array<() => Promise<{ default: ComponentType<any> }>>
): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      importFns.forEach(fn => fn());
    }, { timeout: 3000 });
  } else {
    setTimeout(() => {
      importFns.forEach(fn => fn());
    }, 500);
  }
}

/**
 * Preload component on hover/focus of a trigger element
 */
export function createHoverPreloader(
  importFn: () => Promise<{ default: ComponentType<any> }>
): {
  onMouseEnter: () => void;
  onFocus: () => void;
} {
  let preloaded = false;
  
  const preload = () => {
    if (!preloaded) {
      preloaded = true;
      importFn();
    }
  };
  
  return {
    onMouseEnter: preload,
    onFocus: preload,
  };
}

/**
 * Route-based preloading configuration
 */
export const routePreloads: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
  '/dashboard': () => import('@/pages/Dashboard'),
  '/goals': () => import('@/pages/Goals'),
  '/budget': () => import('@/pages/Budget'),
  '/transactions': () => import('@/pages/Transactions'),
  '/coach': () => import('@/pages/Coach'),
  '/digital-twin': () => import('@/pages/DigitalTwin'),
  '/settings': () => import('@/pages/Settings'),
};

/**
 * Preload routes that are likely to be visited next
 */
export function preloadAdjacentRoutes(currentRoute: string): void {
  const adjacentRoutes: Record<string, string[]> = {
    '/dashboard': ['/goals', '/budget', '/transactions'],
    '/goals': ['/dashboard', '/budget'],
    '/budget': ['/dashboard', '/transactions'],
    '/transactions': ['/dashboard', '/budget'],
    '/coach': ['/dashboard', '/digital-twin'],
  };
  
  const routesToPreload = adjacentRoutes[currentRoute] || [];
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      routesToPreload.forEach(route => {
        const preloadFn = routePreloads[route];
        if (preloadFn) preloadFn();
      });
    }, { timeout: 5000 });
  }
}
