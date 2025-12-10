/**
 * Upstash Redis Client Utility
 * Provides simple Redis operations via Upstash REST API
 */

const UPSTASH_REDIS_REST_URL = Deno.env.get('UPSTASH_REDIS_REST_URL');
const UPSTASH_REDIS_REST_TOKEN = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

interface RedisResponse<T = unknown> {
  result: T;
}

export async function redisCommand<T = unknown>(command: string[]): Promise<T | null> {
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    console.warn('[Redis] Missing Upstash credentials, skipping Redis operation');
    return null;
  }

  try {
    const response = await fetch(UPSTASH_REDIS_REST_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      console.error('[Redis] Request failed:', response.status, await response.text());
      return null;
    }

    const data: RedisResponse<T> = await response.json();
    return data.result;
  } catch (error) {
    console.error('[Redis] Error:', error);
    return null;
  }
}

/**
 * Get a value from Redis
 */
export async function redisGet<T = string>(key: string): Promise<T | null> {
  return redisCommand<T>(['GET', key]);
}

/**
 * Set a value in Redis with optional TTL
 */
export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<boolean> {
  const command = ttlSeconds
    ? ['SET', key, value, 'EX', ttlSeconds.toString()]
    : ['SET', key, value];
  
  const result = await redisCommand<string>(command);
  return result === 'OK';
}

/**
 * Set a JSON value in Redis with optional TTL
 */
export async function redisSetJSON<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<boolean> {
  return redisSet(key, JSON.stringify(value), ttlSeconds);
}

/**
 * Get a JSON value from Redis
 */
export async function redisGetJSON<T>(key: string): Promise<T | null> {
  const result = await redisGet(key);
  if (!result) return null;
  
  try {
    return JSON.parse(result) as T;
  } catch {
    return null;
  }
}

/**
 * Increment a counter in Redis
 */
export async function redisIncr(key: string): Promise<number | null> {
  return redisCommand<number>(['INCR', key]);
}

/**
 * Set expiration on a key
 */
export async function redisExpire(key: string, seconds: number): Promise<boolean> {
  const result = await redisCommand<number>(['EXPIRE', key, seconds.toString()]);
  return result === 1;
}

/**
 * Delete a key from Redis
 */
export async function redisDel(key: string): Promise<boolean> {
  const result = await redisCommand<number>(['DEL', key]);
  return result === 1;
}

/**
 * Check if a key exists
 */
export async function redisExists(key: string): Promise<boolean> {
  const result = await redisCommand<number>(['EXISTS', key]);
  return result === 1;
}

/**
 * Get TTL of a key in seconds
 */
export async function redisTTL(key: string): Promise<number | null> {
  return redisCommand<number>(['TTL', key]);
}
