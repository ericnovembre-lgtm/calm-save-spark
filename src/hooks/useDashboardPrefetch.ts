/**
 * Dashboard Prefetch Hook
 * Preloads dashboard layout in background when user logs in
 * for instant dashboard loads
 */

import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { dashboardCache } from '@/lib/dashboard-cache';
import { coalescer, createCacheKey } from '@/lib/request-coalescer';

/**
 * Prefetch dashboard layout in background using requestIdleCallback
 * This warms the cache before user navigates to /dashboard
 */
export function useDashboardPrefetch(userId: string | undefined) {
  const hasPrefetched = useRef(false);

  useEffect(() => {
    if (!userId || hasPrefetched.current) return;

    const prefetch = async () => {
      try {
        // Check if we already have a fresh cache
        const cached = await dashboardCache.get(userId);
        if (cached && !(cached as any).isStale) {
          console.debug('[DashboardPrefetch] Fresh cache exists, skipping prefetch');
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const cacheKey = createCacheKey('POST', 'generate-dashboard-layout', { userId });

        // Use coalescer to prevent duplicate prefetch requests
        await coalescer.fetch(cacheKey, async () => {
          console.debug('[DashboardPrefetch] Prefetching dashboard layout...');
          
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-dashboard-layout`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ forceRefresh: false, stream: false }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data?.dashboard) {
              await dashboardCache.set(userId, {
                layout: data.dashboard.layout,
                widgets: data.dashboard.widgets,
                theme: data.dashboard.theme,
                briefing: data.dashboard.briefing,
              });
              console.debug('[DashboardPrefetch] Dashboard prefetched successfully');
            }
          }
        });

        hasPrefetched.current = true;
      } catch (error) {
        console.debug('[DashboardPrefetch] Prefetch failed (non-critical):', error);
      }
    };

    // Use requestIdleCallback for non-blocking prefetch
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => prefetch(), { timeout: 5000 });
    } else {
      // Fallback: delay prefetch to not block initial render
      setTimeout(prefetch, 2000);
    }
  }, [userId]);
}
