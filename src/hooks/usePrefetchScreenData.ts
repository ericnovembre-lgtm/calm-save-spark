/**
 * Screen Data Prefetch Hook
 * Phase 6: Backend Optimization
 * 
 * Prefetches data for likely next screens during idle time
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ScreenPrefetchConfig {
  enabled?: boolean;
  idleTimeout?: number;
}

// Track prefetched screens to avoid duplicate fetches
const prefetchedScreens = new Set<string>();

/**
 * Maps current routes to likely next routes and their data requirements
 */
const SCREEN_DATA_MAP: Record<string, {
  nextScreens: string[];
  dataToFetch: { key: string; fetcher: (userId: string) => Promise<unknown> }[];
}> = {
  '/dashboard': {
    nextScreens: ['/coach', '/goals', '/transactions'],
    dataToFetch: [
      {
        key: 'goals-list',
        fetcher: async (userId) => {
          const { data } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          return data;
        },
      },
      {
        key: 'recent-transactions',
        fetcher: async (userId) => {
          const { data } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('transaction_date', { ascending: false })
            .limit(50);
          return data;
        },
      },
    ],
  },
  '/goals': {
    nextScreens: ['/dashboard', '/pots'],
    dataToFetch: [
      {
        key: 'pots-list',
        fetcher: async (userId) => {
          const { data } = await supabase
            .from('pots')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);
          return data;
        },
      },
    ],
  },
  '/coach': {
    nextScreens: ['/digital-twin', '/dashboard'],
    dataToFetch: [
      {
        key: 'financial-health',
        fetcher: async (userId) => {
          const { data } = await supabase
            .from('financial_health_history')
            .select('*')
            .eq('user_id', userId)
            .order('calculated_at', { ascending: false })
            .limit(1);
          return data?.[0];
        },
      },
    ],
  },
  '/transactions': {
    nextScreens: ['/dashboard', '/budgets'],
    dataToFetch: [
      {
        key: 'budgets-list',
        fetcher: async (userId) => {
          const { data } = await supabase
            .from('user_budgets')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);
          return data;
        },
      },
    ],
  },
};

/**
 * Hook to prefetch data for likely next screens
 */
export function usePrefetchScreenData(config: ScreenPrefetchConfig = {}) {
  const { enabled = true, idleTimeout = 2000 } = config;
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const idleCallbackRef = useRef<number | ReturnType<typeof setTimeout> | null>(null);
  
  const prefetchScreenData = useCallback(async () => {
    if (!user) return;
    
    const currentPath = location.pathname;
    const screenConfig = SCREEN_DATA_MAP[currentPath];
    
    if (!screenConfig) return;
    
    // Check connection quality
    const nav = navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } };
    if (nav.connection?.effectiveType === '2g' || nav.connection?.saveData) {
      console.debug('[ScreenPrefetch] Skipping - slow connection');
      return;
    }
    
    for (const dataConfig of screenConfig.dataToFetch) {
      const cacheKey = `${currentPath}:${dataConfig.key}`;
      
      if (prefetchedScreens.has(cacheKey)) continue;
      
      try {
        console.debug(`[ScreenPrefetch] Prefetching: ${dataConfig.key}`);
        
        const data = await dataConfig.fetcher(user.id);
        
        queryClient.setQueryData([dataConfig.key], data);
        
        prefetchedScreens.add(cacheKey);
        
        console.debug(`[ScreenPrefetch] Cached: ${dataConfig.key}`);
      } catch (err) {
        console.warn(`[ScreenPrefetch] Failed to prefetch ${dataConfig.key}:`, err);
      }
    }
  }, [user, location.pathname, queryClient]);
  
  const schedulePrefetch = useCallback(() => {
    if (!enabled || !user) return;
    
    if (idleCallbackRef.current !== null) {
      if ('cancelIdleCallback' in window) {
        cancelIdleCallback(idleCallbackRef.current as number);
      } else {
        clearTimeout(idleCallbackRef.current as ReturnType<typeof setTimeout>);
      }
    }
    
    if ('requestIdleCallback' in window) {
      idleCallbackRef.current = requestIdleCallback(
        () => prefetchScreenData(),
        { timeout: idleTimeout }
      );
    } else {
      idleCallbackRef.current = setTimeout(prefetchScreenData, idleTimeout);
    }
  }, [enabled, user, idleTimeout, prefetchScreenData]);
  
  useEffect(() => {
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
  
  const prefetchNow = useCallback(() => {
    prefetchScreenData();
  }, [prefetchScreenData]);
  
  return { prefetchNow };
}

/**
 * Clear prefetch cache (e.g., on logout)
 */
export function clearScreenPrefetchCache(): void {
  prefetchedScreens.clear();
}
