/**
 * Redis-based Rate Limiter
 * Sliding window rate limiting using Upstash Redis
 */

import { redisCommand } from './upstash-redis.ts';

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  totalRequests: number;
}

// Default rate limit configurations by endpoint type
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // AI endpoints - more restrictive due to cost
  'ai-agent': { maxRequests: 30, windowSeconds: 60 },
  'generate-dashboard-layout': { maxRequests: 10, windowSeconds: 60 },
  'copilot-respond': { maxRequests: 20, windowSeconds: 60 },
  'ai-coach': { maxRequests: 20, windowSeconds: 60 },
  
  // General endpoints
  'default': { maxRequests: 100, windowSeconds: 60 },
  
  // High-frequency endpoints
  'instant-transaction-alert': { maxRequests: 200, windowSeconds: 60 },
};

/**
 * Check rate limit for a given identifier (user ID or IP)
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const limitConfig = config || RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS['default'];
  const key = `ratelimit:${endpoint}:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - limitConfig.windowSeconds;

  try {
    // Use Redis MULTI/EXEC for atomic operations via pipeline
    const UPSTASH_REDIS_REST_URL = Deno.env.get('UPSTASH_REDIS_REST_URL');
    const UPSTASH_REDIS_REST_TOKEN = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      // If Redis unavailable, allow request (fail open)
      console.warn('[RateLimit] Redis unavailable, allowing request');
      return {
        allowed: true,
        remaining: limitConfig.maxRequests,
        resetInSeconds: limitConfig.windowSeconds,
        totalRequests: 0,
      };
    }

    // Pipeline: Remove old entries, add new entry, count entries, set expiry
    const pipeline = [
      ['ZREMRANGEBYSCORE', key, '0', windowStart.toString()],
      ['ZADD', key, now.toString(), `${now}:${Math.random().toString(36).slice(2)}`],
      ['ZCARD', key],
      ['EXPIRE', key, (limitConfig.windowSeconds + 1).toString()],
    ];

    const response = await fetch(`${UPSTASH_REDIS_REST_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipeline),
    });

    if (!response.ok) {
      console.error('[RateLimit] Pipeline failed:', response.status);
      return {
        allowed: true,
        remaining: limitConfig.maxRequests,
        resetInSeconds: limitConfig.windowSeconds,
        totalRequests: 0,
      };
    }

    const results = await response.json();
    const totalRequests = results[2]?.result || 0;
    const allowed = totalRequests <= limitConfig.maxRequests;
    const remaining = Math.max(0, limitConfig.maxRequests - totalRequests);

    return {
      allowed,
      remaining,
      resetInSeconds: limitConfig.windowSeconds,
      totalRequests,
    };
  } catch (error) {
    console.error('[RateLimit] Error:', error);
    // Fail open - allow request if rate limiting fails
    return {
      allowed: true,
      remaining: limitConfig.maxRequests,
      resetInSeconds: limitConfig.windowSeconds,
      totalRequests: 0,
    };
  }
}

/**
 * Create rate limit headers for response
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.totalRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetInSeconds.toString(),
  };
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitExceededResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter: result.resetInSeconds,
      remaining: result.remaining,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        ...rateLimitHeaders(result),
        'Content-Type': 'application/json',
        'Retry-After': result.resetInSeconds.toString(),
      },
    }
  );
}
