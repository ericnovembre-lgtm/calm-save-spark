/**
 * Sentry Error Tracking Configuration
 * Provides comprehensive error tracking, session replay, and performance monitoring
 */
import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

/**
 * Initialize Sentry with optimal configuration
 * Call this before rendering the app in main.tsx
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured, error tracking disabled');
    return;
  }

  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Enable default PII collection (IP addresses, user agents)
    sendDefaultPii: true,
    
    // Environment configuration
    environment: isDevelopment ? 'development' : 'production',
    
    // Enable debug logging in development
    debug: isDevelopment,
    
    // Sample rates - adjust based on traffic
    tracesSampleRate: isProduction ? 0.2 : 1.0, // 20% in prod, 100% in dev
    replaysSessionSampleRate: isProduction ? 0.1 : 0, // 10% session replay in prod
    replaysOnErrorSampleRate: 1.0, // Always capture replay on errors
    
    // Integrations
    // Trace propagation targets for performance monitoring
    tracePropagationTargets: ['localhost', /^https:\/\/.*\.supabase\.co/],
    
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration(),
      // Session replay for error debugging
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        // Mask sensitive inputs
        maskAllInputs: true,
      }),
    ],
    
    // Filter out noise
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      /extensions\//i,
      /^chrome:\/\//i,
      // Network errors that are expected
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      // Third-party scripts
      /^Script error\.?$/,
    ],
    
    // Before sending error, add context
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (isDevelopment && !import.meta.env.VITE_SENTRY_FORCE_DEV) {
        console.log('[Sentry] Event captured (dev):', event);
        return null;
      }
      return event;
    },
  });
}

/**
 * Set user context for error tracking
 * Call this after user authentication
 */
export function setSentryUser(user: { id: string; email?: string; name?: string } | null): void {
  if (!SENTRY_DSN) return;
  
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add custom breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string = 'app',
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>
): void {
  if (!SENTRY_DSN) return;
  
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

/**
 * Capture an exception with optional context
 */
export function captureException(
  error: Error | unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    level?: Sentry.SeverityLevel;
  }
): string | undefined {
  if (!SENTRY_DSN) {
    console.error('[Sentry] Error captured (no DSN):', error);
    return undefined;
  }
  
  return Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    level: context?.level,
  });
}

/**
 * Capture a message for logging purposes
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info'
): string | undefined {
  if (!SENTRY_DSN) return undefined;
  return Sentry.captureMessage(message, level);
}

/**
 * Report Web Vitals metrics to Sentry
 * Call this after Sentry initialization
 */
export function reportWebVitalsToSentry(): void {
  if (!SENTRY_DSN) return;
  
  import('web-vitals').then(({ onLCP, onCLS, onFCP, onTTFB, onINP }) => {
    const reportMetric = (metric: { name: string; value: number; id: string }) => {
      // Add as breadcrumb for context
      addBreadcrumb(
        `Web Vital: ${metric.name} = ${metric.value.toFixed(2)}`,
        'web-vitals',
        'info',
        { metric_id: metric.id, value: metric.value, name: metric.name }
      );
      
      // Log performance issues
      const thresholds: Record<string, number> = {
        LCP: 2500,  // Good LCP is under 2.5s
        CLS: 0.1,   // Good CLS is under 0.1
        FCP: 1800,  // Good FCP is under 1.8s
        TTFB: 800,  // Good TTFB is under 800ms
        INP: 200,   // Good INP is under 200ms
      };
      
      if (thresholds[metric.name] && metric.value > thresholds[metric.name]) {
        captureMessage(
          `Poor ${metric.name}: ${metric.value.toFixed(0)}ms (threshold: ${thresholds[metric.name]}ms)`,
          'warning'
        );
      }
    };
    
    onLCP(reportMetric);
    onCLS(reportMetric);
    onFCP(reportMetric);
    onTTFB(reportMetric);
    onINP(reportMetric);
  }).catch((err) => {
    console.warn('[Sentry] Failed to load web-vitals:', err);
  });
}

// Re-export Sentry for direct usage when needed
export { Sentry };
