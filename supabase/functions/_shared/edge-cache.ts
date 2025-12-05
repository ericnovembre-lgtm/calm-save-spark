/**
 * Edge Function Caching Utilities
 * Provides in-memory LRU cache and database-backed persistent cache for edge functions
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// =============================================================================
// In-Memory LRU Cache (within single invocation, survives warm starts)
// =============================================================================

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

interface EdgeCacheOptions {
  maxEntries?: number;
  defaultTTL?: number; // seconds
}

const DEFAULT_OPTIONS: Required<EdgeCacheOptions> = {
  maxEntries: 100,
  defaultTTL: 300, // 5 minutes
};

// Global in-memory cache (persists across warm invocations)
const memoryCache = new Map<string, CacheEntry<unknown>>();
let cacheStats = { hits: 0, misses: 0 };

/**
 * Get value from in-memory cache
 */
export function getFromMemoryCache<T>(key: string): T | null {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
  
  if (!entry) {
    cacheStats.misses++;
    return null;
  }
  
  // Check expiration
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    cacheStats.misses++;
    return null;
  }
  
  cacheStats.hits++;
  return entry.value;
}

/**
 * Set value in in-memory cache
 */
export function setInMemoryCache<T>(
  key: string, 
  value: T, 
  ttlSeconds: number = DEFAULT_OPTIONS.defaultTTL
): void {
  // Enforce max entries (simple LRU - remove oldest)
  if (memoryCache.size >= DEFAULT_OPTIONS.maxEntries) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + (ttlSeconds * 1000),
    createdAt: Date.now(),
  });
}

/**
 * Get or set pattern - check cache, compute if miss, cache result
 */
export async function getOrSetMemoryCache<T>(
  key: string,
  compute: () => Promise<T>,
  ttlSeconds?: number
): Promise<{ value: T; fromCache: boolean }> {
  const cached = getFromMemoryCache<T>(key);
  if (cached !== null) {
    return { value: cached, fromCache: true };
  }
  
  const value = await compute();
  setInMemoryCache(key, value, ttlSeconds);
  return { value, fromCache: false };
}

/**
 * Clear expired entries from memory cache
 */
export function clearExpiredMemoryCache(): number {
  let cleared = 0;
  const now = Date.now();
  
  for (const [key, entry] of memoryCache.entries()) {
    if (now > entry.expiresAt) {
      memoryCache.delete(key);
      cleared++;
    }
  }
  
  return cleared;
}

/**
 * Get cache statistics
 */
export function getMemoryCacheStats() {
  return {
    ...cacheStats,
    size: memoryCache.size,
    hitRate: cacheStats.hits + cacheStats.misses > 0 
      ? cacheStats.hits / (cacheStats.hits + cacheStats.misses) 
      : 0,
  };
}

// =============================================================================
// Database-Backed Persistent Cache (survives cold starts)
// =============================================================================

/**
 * Get value from database cache (api_response_cache table)
 */
export async function getFromDbCache<T>(
  supabase: SupabaseClient,
  cacheKey: string
): Promise<T | null> {
  try {
    const { data, error } = await supabase.rpc('get_cached_response', {
      p_cache_key: cacheKey
    });
    
    if (error) {
      console.error('DB cache get error:', error);
      return null;
    }
    
    return data as T | null;
  } catch (err) {
    console.error('DB cache get exception:', err);
    return null;
  }
}

/**
 * Set value in database cache
 */
export async function setInDbCache<T>(
  supabase: SupabaseClient,
  cacheKey: string,
  cacheType: string,
  userId: string | null,
  data: T,
  ttlSeconds: number = DEFAULT_OPTIONS.defaultTTL
): Promise<void> {
  try {
    await supabase.rpc('set_cached_response', {
      p_cache_key: cacheKey,
      p_cache_type: cacheType,
      p_user_id: userId,
      p_response_data: data,
      p_ttl_seconds: ttlSeconds
    });
  } catch (err) {
    console.error('DB cache set exception:', err);
  }
}

/**
 * Get or set pattern for database cache
 */
export async function getOrSetDbCache<T>(
  supabase: SupabaseClient,
  cacheKey: string,
  cacheType: string,
  userId: string | null,
  compute: () => Promise<T>,
  ttlSeconds?: number
): Promise<{ value: T; fromCache: boolean }> {
  // Try database cache first
  const cached = await getFromDbCache<T>(supabase, cacheKey);
  if (cached !== null) {
    return { value: cached, fromCache: true };
  }
  
  // Compute and cache
  const value = await compute();
  await setInDbCache(supabase, cacheKey, cacheType, userId, value, ttlSeconds);
  return { value, fromCache: false };
}

// =============================================================================
// Tiered Caching (Memory → Database)
// =============================================================================

/**
 * Tiered cache lookup: Memory cache first, then database cache
 * Most efficient for frequently accessed data
 */
export async function getFromTieredCache<T>(
  supabase: SupabaseClient,
  cacheKey: string
): Promise<{ value: T | null; source: 'memory' | 'db' | 'none' }> {
  // Check memory first (fastest)
  const memoryValue = getFromMemoryCache<T>(cacheKey);
  if (memoryValue !== null) {
    return { value: memoryValue, source: 'memory' };
  }
  
  // Check database (slower but survives cold starts)
  const dbValue = await getFromDbCache<T>(supabase, cacheKey);
  if (dbValue !== null) {
    // Populate memory cache for subsequent requests
    setInMemoryCache(cacheKey, dbValue);
    return { value: dbValue, source: 'db' };
  }
  
  return { value: null, source: 'none' };
}

/**
 * Set value in both tiers
 */
export async function setInTieredCache<T>(
  supabase: SupabaseClient,
  cacheKey: string,
  cacheType: string,
  userId: string | null,
  value: T,
  ttlSeconds: number = DEFAULT_OPTIONS.defaultTTL
): Promise<void> {
  // Set in memory (immediate)
  setInMemoryCache(cacheKey, value, ttlSeconds);
  
  // Set in database (background, don't await if not critical)
  setInDbCache(supabase, cacheKey, cacheType, userId, value, ttlSeconds);
}

/**
 * Full tiered get-or-set pattern
 */
export async function getOrSetTieredCache<T>(
  supabase: SupabaseClient,
  cacheKey: string,
  cacheType: string,
  userId: string | null,
  compute: () => Promise<T>,
  ttlSeconds?: number
): Promise<{ value: T; source: 'memory' | 'db' | 'computed' }> {
  // Check both tiers
  const { value: cached, source } = await getFromTieredCache<T>(supabase, cacheKey);
  if (cached !== null && source !== 'none') {
    return { value: cached, source };
  }
  
  // Compute and cache in both tiers
  const value = await compute();
  await setInTieredCache(supabase, cacheKey, cacheType, userId, value, ttlSeconds);
  return { value, source: 'computed' };
}

// =============================================================================
// Cache Key Helpers
// =============================================================================

/**
 * Create a user-scoped cache key
 */
export function createUserCacheKey(prefix: string, userId: string, ...parts: string[]): string {
  return [prefix, userId, ...parts].join(':');
}

/**
 * Create a global (non-user-specific) cache key
 */
export function createGlobalCacheKey(prefix: string, ...parts: string[]): string {
  return ['global', prefix, ...parts].join(':');
}

/**
 * Create a hash-based cache key for complex objects
 */
export function createHashCacheKey(prefix: string, obj: Record<string, unknown>): string {
  const str = JSON.stringify(obj, Object.keys(obj).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${prefix}:${Math.abs(hash).toString(36)}`;
}

// =============================================================================
// Response Helpers
// =============================================================================

/**
 * Create a response with cache headers
 */
export function createCachedResponse<T>(
  data: T,
  fromCache: boolean,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Cache': fromCache ? 'HIT' : 'MISS',
        'X-Cache-Time': new Date().toISOString(),
      } 
    }
  );
}
