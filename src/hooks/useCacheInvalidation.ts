/**
 * Smart Cache Invalidation Hook
 * Phase 6: Backend Optimization
 * 
 * Automatically invalidates related caches when mutations occur
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MutationType, getInvalidationKeys } from '@/lib/query-invalidation-rules';
import { clearSWRCache } from './useSWR';

interface InvalidationOptions {
  immediate?: boolean;
  refetchActive?: boolean;
  refetchInactive?: boolean;
}

/**
 * Hook for smart cache invalidation based on mutation type
 */
export function useCacheInvalidation() {
  const queryClient = useQueryClient();
  
  /**
   * Invalidate caches based on mutation type
   */
  const invalidate = useCallback(async (
    mutation: MutationType,
    options: InvalidationOptions = {}
  ) => {
    const { immediate = true, refetchActive = true, refetchInactive = false } = options;
    
    const keysToInvalidate = getInvalidationKeys(mutation);
    
    console.debug(`[CacheInvalidation] Invalidating for ${mutation}:`, keysToInvalidate);
    
    // Invalidate React Query caches
    const invalidationPromises = keysToInvalidate.map(key => 
      queryClient.invalidateQueries({
        queryKey: [key],
        refetchType: refetchActive ? 'active' : refetchInactive ? 'inactive' : 'none',
      })
    );
    
    // Clear SWR caches
    keysToInvalidate.forEach(key => clearSWRCache(key));
    
    if (immediate) {
      await Promise.all(invalidationPromises);
    }
  }, [queryClient]);
  
  /**
   * Invalidate specific query keys
   */
  const invalidateKeys = useCallback(async (
    keys: string[],
    options: InvalidationOptions = {}
  ) => {
    const { immediate = true, refetchActive = true, refetchInactive = false } = options;
    
    console.debug('[CacheInvalidation] Invalidating keys:', keys);
    
    const invalidationPromises = keys.map(key => 
      queryClient.invalidateQueries({
        queryKey: [key],
        refetchType: refetchActive ? 'active' : refetchInactive ? 'inactive' : 'none',
      })
    );
    
    keys.forEach(key => clearSWRCache(key));
    
    if (immediate) {
      await Promise.all(invalidationPromises);
    }
  }, [queryClient]);
  
  /**
   * Clear all caches (nuclear option)
   */
  const clearAll = useCallback(async () => {
    console.debug('[CacheInvalidation] Clearing all caches');
    queryClient.clear();
    clearSWRCache();
  }, [queryClient]);
  
  /**
   * Prefetch and warm cache after invalidation
   */
  const invalidateAndPrefetch = useCallback(async <T>(
    mutation: MutationType,
    prefetcher: () => Promise<T>,
    prefetchKey: string
  ) => {
    await invalidate(mutation, { immediate: true, refetchActive: false });
    
    // Warm the cache with fresh data
    const data = await prefetcher();
    queryClient.setQueryData([prefetchKey], data);
    
    return data;
  }, [invalidate, queryClient]);
  
  return {
    invalidate,
    invalidateKeys,
    clearAll,
    invalidateAndPrefetch,
  };
}

/**
 * Create an invalidation callback for a specific mutation
 */
export function createInvalidator(mutation: MutationType) {
  return (queryClient: ReturnType<typeof useQueryClient>) => {
    const keysToInvalidate = getInvalidationKeys(mutation);
    
    keysToInvalidate.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
      clearSWRCache(key);
    });
  };
}
