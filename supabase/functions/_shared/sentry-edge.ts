/**
 * Sentry Error Tracking for Edge Functions
 * Lightweight error capture for server-side monitoring
 */

const SENTRY_DSN = Deno.env.get('SENTRY_DSN');

interface SentryEvent {
  exception?: {
    values: Array<{
      type: string;
      value: string;
      stacktrace?: {
        frames: Array<{
          filename?: string;
          function?: string;
          lineno?: number;
          colno?: number;
        }>;
      };
    }>;
  };
  message?: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  timestamp: number;
  platform: string;
  environment: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  transaction?: string;
}

/**
 * Parse Sentry DSN to extract project details
 */
function parseDSN(dsn: string): { publicKey: string; host: string; projectId: string } | null {
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const host = url.host;
    const projectId = url.pathname.slice(1);
    return { publicKey, host, projectId };
  } catch {
    return null;
  }
}

/**
 * Capture an exception and send to Sentry
 */
export async function captureEdgeException(
  error: Error | unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    transaction?: string;
  }
): Promise<void> {
  if (!SENTRY_DSN) {
    console.error('[Sentry Edge] Error (no DSN):', error);
    return;
  }

  const parsed = parseDSN(SENTRY_DSN);
  if (!parsed) {
    console.error('[Sentry Edge] Invalid DSN');
    return;
  }

  const err = error instanceof Error ? error : new Error(String(error));
  
  const event: SentryEvent = {
    exception: {
      values: [{
        type: err.name,
        value: err.message,
        stacktrace: err.stack ? {
          frames: err.stack.split('\n').slice(1).map(line => {
            const match = line.match(/at (\S+) \((.+):(\d+):(\d+)\)/);
            if (match) {
              return {
                function: match[1],
                filename: match[2],
                lineno: parseInt(match[3]),
                colno: parseInt(match[4]),
              };
            }
            return { filename: line.trim() };
          }).reverse(),
        } : undefined,
      }],
    },
    level: 'error',
    timestamp: Date.now() / 1000,
    platform: 'node',
    environment: Deno.env.get('ENVIRONMENT') || 'production',
    tags: {
      runtime: 'deno',
      ...context?.tags,
    },
    extra: context?.extra,
    transaction: context?.transaction,
  };

  const endpoint = `https://${parsed.host}/api/${parsed.projectId}/store/`;
  
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=edge-functions/1.0, sentry_key=${parsed.publicKey}`,
      },
      body: JSON.stringify(event),
    });
  } catch (sendError) {
    console.error('[Sentry Edge] Failed to send event:', sendError);
  }
}

/**
 * Capture a message for logging
 */
export async function captureEdgeMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): Promise<void> {
  if (!SENTRY_DSN) return;

  const parsed = parseDSN(SENTRY_DSN);
  if (!parsed) return;

  const event: SentryEvent = {
    message,
    level,
    timestamp: Date.now() / 1000,
    platform: 'node',
    environment: Deno.env.get('ENVIRONMENT') || 'production',
    tags: {
      runtime: 'deno',
      ...context?.tags,
    },
    extra: context?.extra,
  };

  const endpoint = `https://${parsed.host}/api/${parsed.projectId}/store/`;
  
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=edge-functions/1.0, sentry_key=${parsed.publicKey}`,
      },
      body: JSON.stringify(event),
    });
  } catch {
    // Silent fail for edge function messages
  }
}

/**
 * Wrapper to automatically capture errors in edge function handlers
 */
export function withSentryEdge<T>(
  handler: (req: Request) => Promise<Response>,
  functionName: string
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      await captureEdgeException(error, {
        transaction: functionName,
        tags: {
          function: functionName,
          method: req.method,
        },
        extra: {
          url: req.url,
          headers: Object.fromEntries(req.headers.entries()),
        },
      });
      throw error;
    }
  };
}

/**
 * Track edge function performance with timing metrics
 */
export async function trackEdgePerformance<T>(
  name: string,
  operation: () => Promise<T>,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - start;
    
    // Log performance metric
    await captureEdgeMessage(
      `${name} completed in ${duration}ms`,
      duration > 5000 ? 'warning' : 'info',
      {
        tags: { 
          function: name,
          performance: duration > 5000 ? 'slow' : duration > 2000 ? 'moderate' : 'fast',
          ...context?.tags 
        },
        extra: { 
          duration_ms: duration,
          ...context?.extra 
        },
      }
    );
    
    return { result, duration };
  } catch (error) {
    const duration = Date.now() - start;
    
    await captureEdgeException(error, {
      transaction: name,
      tags: { 
        function: name,
        ...context?.tags 
      },
      extra: { 
        duration_ms: duration,
        ...context?.extra 
      },
    });
    
    throw error;
  }
}
