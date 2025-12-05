import { useState, useEffect, useCallback } from 'react';
import { dashboardCache, DashboardCacheEntry } from '@/lib/dashboard-cache';
import { useAuth } from '@/contexts/AuthContext';

interface OfflineDashboardState {
  cachedData: DashboardCacheEntry | null;
  isOffline: boolean;
  isStale: boolean;
  cacheAge: number | null;
  lastCachedAt: Date | null;
}

const STALE_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours

export function useOfflineDashboard() {
  const { user } = useAuth();
  const [state, setState] = useState<OfflineDashboardState>({
    cachedData: null,
    isOffline: !navigator.onLine,
    isStale: false,
    cacheAge: null,
    lastCachedAt: null,
  });

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setState(s => ({ ...s, isOffline: false }));
    const handleOffline = () => setState(s => ({ ...s, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached data on mount and check staleness
  useEffect(() => {
    if (!user?.id) return;

    const loadCache = async () => {
      const cached = await dashboardCache.get(user.id);
      if (cached) {
        const cacheAge = Date.now() - cached.cachedAt;
        const isStale = cacheAge > STALE_THRESHOLD_MS;
        setState(s => ({
          ...s,
          cachedData: cached,
          isStale,
          cacheAge,
          lastCachedAt: new Date(cached.cachedAt),
        }));
      }
    };

    loadCache();
  }, [user?.id]);

  // Periodically check staleness
  useEffect(() => {
    const interval = setInterval(() => {
      setState(s => {
        if (!s.cachedData) return s;
        const cacheAge = Date.now() - s.cachedData.cachedAt;
        return {
          ...s,
          cacheAge,
          isStale: cacheAge > STALE_THRESHOLD_MS
        };
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Save data to cache
  const saveToCache = useCallback(async (data: {
    layout: any;
    widgets: Record<string, any>;
    theme: any;
    briefing: any;
  }) => {
    if (!user?.id) return;

    await dashboardCache.set(user.id, data);
    setState(s => ({
      ...s,
      cachedData: { ...data, userId: user.id, cachedAt: Date.now() },
      isStale: false,
      cacheAge: 0,
      lastCachedAt: new Date(),
    }));
  }, [user?.id]);

  // Get cached layout for offline display
  const getCachedLayout = useCallback(async () => {
    if (!user?.id) return null;
    return dashboardCache.get(user.id);
  }, [user?.id]);

  // Clear cache
  const clearCache = useCallback(async () => {
    if (!user?.id) return;
    await dashboardCache.clear(user.id);
    setState(s => ({
      ...s,
      cachedData: null,
      cacheAge: null,
      lastCachedAt: null,
      isStale: false,
    }));
  }, [user?.id]);

  // Format cache age for display
  const formatCacheAge = useCallback(() => {
    if (!state.cacheAge) return null;
    
    const minutes = Math.floor(state.cacheAge / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  }, [state.cacheAge]);

  return {
    ...state,
    saveToCache,
    getCachedLayout,
    clearCache,
    formatCacheAge,
    hasCache: !!state.cachedData,
  };
}
