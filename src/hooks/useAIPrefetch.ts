/**
 * AI Prefetch Hook
 * Phase 6: Backend Optimization
 * 
 * Warms AI responses during idle time for faster perceived performance
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { prefetchSWR } from './useSWR';

interface PrefetchConfig {
  enabled?: boolean;
  idleTimeout?: number;
  maxPrefetches?: number;
}

// Track what's already been prefetched this session
const prefetchedContexts = new Set<string>();

/**
 * AI context prefetch configurations by current route
 */
const AI_PREFETCH_MAP: Record<string, { contexts: string[]; priority: number }> = {
  '/dashboard': {
    contexts: ['coach', 'digital-twin-baseline', 'ai-insights'],
    priority: 1,
  },
  '/goals': {
    contexts: ['goal-recommendations', 'coach'],
    priority: 2,
  },
  '/budgets': {
    contexts: ['budget-optimization', 'spending-insights'],
    priority: 2,
  },
  '/coach': {
    contexts: ['digital-twin-baseline', 'financial-health'],
    priority: 1,
  },
  '/digital-twin': {
    contexts: ['coach', 'projections'],
    priority: 1,
  },
};

/**
 * Hook to prefetch AI contexts during idle time
 */
export function useAIPrefetch(config: PrefetchConfig = {}) {
  const { enabled = true, idleTimeout = 3000, maxPrefetches = 2 } = config;
  const { user } = useAuth();
  const location = useLocation();
  const idleCallbackRef = useRef<number | ReturnType<typeof setTimeout> | null>(null);
  const prefetchCountRef = useRef(0);
  
  const prefetchAIContext = useCallback(async (context: string) => {
    if (!user || prefetchedContexts.has(context)) return;
    if (prefetchCountRef.current >= maxPrefetches) return;
    
    try {
      prefetchCountRef.current++;
      prefetchedContexts.add(context);
      
      console.debug(`[AIPrefetch] Warming context: ${context}`);
      
      const { data, error } = await supabase.functions.invoke('prefetch-ai-context', {
        body: { context, userId: user.id },
      });
      
      if (error) {
        console.warn(`[AIPrefetch] Failed to prefetch ${context}:`, error);
        prefetchedContexts.delete(context);
        return;
      }
      
      if (data?.cacheKey && data?.result) {
        prefetchSWR(data.cacheKey, async () => data.result);
      }
      
      console.debug(`[AIPrefetch] Successfully warmed: ${context}`);
    } catch (err) {
      console.warn(`[AIPrefetch] Error prefetching ${context}:`, err);
      prefetchedContexts.delete(context);
    }
  }, [user, maxPrefetches]);
  
  const schedulePrefetch = useCallback(() => {
    if (!enabled || !user) return;
    
    // Cancel any pending prefetch
    if (idleCallbackRef.current !== null) {
      if ('cancelIdleCallback' in window) {
        cancelIdleCallback(idleCallbackRef.current as number);
      } else {
        clearTimeout(idleCallbackRef.current as ReturnType<typeof setTimeout>);
      }
    }
    
    const currentPath = location.pathname;
    const prefetchConfig = AI_PREFETCH_MAP[currentPath];
    
    if (!prefetchConfig) return;
    
    const doPrefetch = () => {
      // Check connection - skip on slow connections
      const nav = navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } };
      if (nav.connection?.effectiveType === '2g' || nav.connection?.saveData) {
        console.debug('[AIPrefetch] Skipping - slow connection detected');
        return;
      }
      
      const contextsToPrefetch = prefetchConfig.contexts
        .filter(ctx => !prefetchedContexts.has(ctx))
        .slice(0, maxPrefetches - prefetchCountRef.current);
      
      contextsToPrefetch.forEach(ctx => prefetchAIContext(ctx));
    };
    
    if ('requestIdleCallback' in window) {
      idleCallbackRef.current = requestIdleCallback(doPrefetch, { timeout: idleTimeout });
    } else {
      idleCallbackRef.current = setTimeout(doPrefetch, idleTimeout);
    }
  }, [enabled, user, location.pathname, idleTimeout, maxPrefetches, prefetchAIContext]);
  
  useEffect(() => {
    prefetchCountRef.current = 0;
    schedulePrefetch();
    
    return () => {
      if (idleCallbackRef.current !== null) {
        if ('cancelIdleCallback' in window) {
          cancelIdleCallback(idleCallbackRef.current as number);
        } else {
          clearTimeout(idleCallbackRef.current as ReturnType<typeof setTimeout>);
        }
      }
    };
  }, [schedulePrefetch]);
  
  const prefetch = useCallback((contexts: string[]) => {
    contexts.forEach(ctx => prefetchAIContext(ctx));
  }, [prefetchAIContext]);
  
  return {
    prefetch,
    prefetchedContexts: Array.from(prefetchedContexts),
  };
}

/**
 * Clear prefetch cache (e.g., on logout)
 */
export function clearAIPrefetchCache(): void {
  prefetchedContexts.clear();
}
