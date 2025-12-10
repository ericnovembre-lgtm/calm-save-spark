/**
 * Sentry Performance Tracking Utilities
 * Provides wrappers for tracking API calls, page loads, and custom operations
 */
import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

/**
 * Track an API call with timing and error capture
 */
export async function trackApiCall<T>(
  name: string,
  operation: () => Promise<T>,
  options?: { tags?: Record<string, string> }
): Promise<T> {
  if (!SENTRY_DSN) {
    return operation();
  }

  return Sentry.startSpan(
    { 
      name, 
      op: 'http.client',
      attributes: options?.tags,
    }, 
    async (span) => {
      const start = performance.now();
      try {
        const result = await operation();
        const duration = performance.now() - start;
        
        // Add breadcrumb for API call
        Sentry.addBreadcrumb({
          category: 'api',
          message: `${name} completed in ${duration.toFixed(0)}ms`,
          level: 'info',
          data: { 
            endpoint: name, 
            duration_ms: duration,
            status: 'success',
            ...options?.tags 
          },
        });
        
        span?.setStatus({ code: 1, message: 'ok' });
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        
        Sentry.addBreadcrumb({
          category: 'api',
          message: `${name} failed after ${duration.toFixed(0)}ms`,
          level: 'error',
          data: { 
            endpoint: name, 
            duration_ms: duration,
            status: 'error',
            ...options?.tags 
          },
        });
        
        span?.setStatus({ code: 2, message: 'error' });
        throw error;
      }
    }
  );
}

/**
 * Track a page load with timing metrics
 */
export function trackPageLoad(routeName: string): () => void {
  if (!SENTRY_DSN) {
    return () => {};
  }

  const start = performance.now();
  
  // Start a transaction for the page
  const span = Sentry.startInactiveSpan({
    name: routeName,
    op: 'pageload',
    forceTransaction: true,
  });

  return () => {
    const duration = performance.now() - start;
    
    Sentry.addBreadcrumb({
      category: 'pageload',
      message: `Page ${routeName} loaded in ${duration.toFixed(0)}ms`,
      level: 'info',
      data: { route: routeName, duration_ms: duration },
    });
    
    span?.end();
  };
}

/**
 * Track a custom operation with timing
 */
export async function trackOperation<T>(
  name: string,
  operation: () => Promise<T>,
  options?: { 
    op?: string;
    tags?: Record<string, string>;
  }
): Promise<T> {
  if (!SENTRY_DSN) {
    return operation();
  }

  return Sentry.startSpan(
    { 
      name, 
      op: options?.op || 'function',
      attributes: options?.tags,
    }, 
    async (span) => {
      const start = performance.now();
      try {
        const result = await operation();
        span?.setStatus({ code: 1, message: 'ok' });
        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: 'error' });
        throw error;
      } finally {
        const duration = performance.now() - start;
        Sentry.addBreadcrumb({
          category: 'operation',
          message: `${name} completed in ${duration.toFixed(0)}ms`,
          level: 'info',
          data: { operation: name, duration_ms: duration, ...options?.tags },
        });
      }
    }
  );
}

/**
 * Record a custom metric as a breadcrumb
 */
export function recordMetric(
  name: string,
  value: number,
  options?: {
    tags?: Record<string, string>;
    unit?: string;
  }
): void {
  if (!SENTRY_DSN) return;
  
  Sentry.addBreadcrumb({
    category: 'metric',
    message: `${name}: ${value}${options?.unit ? ` ${options.unit}` : ''}`,
    level: 'info',
    data: { metric: name, value, ...options?.tags },
  });
}

/**
 * Track navigation between routes
 */
export function trackNavigation(from: string, to: string): void {
  if (!SENTRY_DSN) return;
  
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Navigated from ${from} to ${to}`,
    level: 'info',
    data: { from, to },
  });
}
