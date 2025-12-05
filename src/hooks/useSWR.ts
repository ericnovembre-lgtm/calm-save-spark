/**
 * Stale-While-Revalidate Hook
 * Phase 6: Backend Optimization
 * 
 * Returns stale data immediately while revalidating in background
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CacheKey, getCacheConfig, isStale, isExpired } from '@/lib/cache-config';

interface SWRCache<T> {
  data: T;
  cachedAt: number;
}

// In-memory cache store
const cacheStore = new Map<string, SWRCache<unknown>>();

interface UseSWROptions<T> {
  cacheKey: CacheKey;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  dedupingInterval?: number;
}

interface UseSWRResult<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  isStale: boolean;
  mutate: (data?: T | ((current: T | undefined) => T)) => void;
  revalidate: () => Promise<void>;
}

/**
 * SWR hook with volatility-based caching
 */
export function useSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseSWROptions<T>
): UseSWRResult<T> {
  const { cacheKey, initialData, onSuccess, onError, enabled = true, dedupingInterval = 2000 } = options;
  const config = getCacheConfig(cacheKey);
  
  const [data, setData] = useState<T | undefined>(() => {
    // Try to get from cache on mount
    const cached = cacheStore.get(key) as SWRCache<T> | undefined;
    if (cached && !isExpired(cacheKey, cached.cachedAt)) {
      return cached.data;
    }
    return initialData;
  });
  
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!data && enabled);
  const [isValidating, setIsValidating] = useState(false);
  
  const lastFetchRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Check if current data is stale
  const cached = cacheStore.get(key) as SWRCache<T> | undefined;
  const dataIsStale = cached ? isStale(cacheKey, cached.cachedAt) : true;
  
  const fetchData = useCallback(async (isRevalidation = false) => {
    // Deduping: skip if fetched recently
    const now = Date.now();
    if (now - lastFetchRef.current < dedupingInterval) {
      return;
    }
    lastFetchRef.current = now;
    
    // Abort previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    if (isRevalidation) {
      setIsValidating(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const result = await fetcher();
      
      // Update cache
      cacheStore.set(key, { data: result, cachedAt: Date.now() });
      
      setData(result);
      setError(null);
      onSuccess?.(result);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      const error = err instanceof Error ? err : new Error('Fetch failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  }, [key, fetcher, dedupingInterval, onSuccess, onError]);
  
  // Initial fetch
  useEffect(() => {
    if (!enabled) return;
    
    const cached = cacheStore.get(key) as SWRCache<T> | undefined;
    
    if (cached) {
      // If we have cached data, use it immediately
      setData(cached.data);
      
      // If stale, revalidate in background
      if (isStale(cacheKey, cached.cachedAt)) {
        fetchData(true);
      }
    } else {
      // No cache, fetch fresh
      fetchData(false);
    }
  }, [key, enabled, cacheKey, fetchData]);
  
  // Background revalidation interval
  useEffect(() => {
    if (!enabled || !config.revalidateInterval) return;
    
    const interval = setInterval(() => {
      fetchData(true);
    }, config.revalidateInterval as number);
    
    return () => clearInterval(interval);
  }, [enabled, config.revalidateInterval, fetchData]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);
  
  const mutate = useCallback((newData?: T | ((current: T | undefined) => T)) => {
    if (newData === undefined) {
      // Clear cache and refetch
      cacheStore.delete(key);
      fetchData(false);
    } else {
      // Optimistically update
      const resolved = typeof newData === 'function' 
        ? (newData as (current: T | undefined) => T)(data)
        : newData;
      
      setData(resolved);
      cacheStore.set(key, { data: resolved, cachedAt: Date.now() });
    }
  }, [key, data, fetchData]);
  
  const revalidate = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);
  
  return {
    data,
    error,
    isLoading,
    isValidating,
    isStale: dataIsStale,
    mutate,
    revalidate,
  };
}

/**
 * Prefetch data into SWR cache
 */
export function prefetchSWR<T>(key: string, fetcher: () => Promise<T>): Promise<void> {
  return fetcher().then(data => {
    cacheStore.set(key, { data, cachedAt: Date.now() });
  });
}

/**
 * Clear SWR cache for a key or all keys
 */
export function clearSWRCache(key?: string): void {
  if (key) {
    cacheStore.delete(key);
  } else {
    cacheStore.clear();
  }
}

/**
 * Get cached data without triggering fetch
 */
export function getSWRCache<T>(key: string): T | undefined {
  const cached = cacheStore.get(key) as SWRCache<T> | undefined;
  return cached?.data;
}
