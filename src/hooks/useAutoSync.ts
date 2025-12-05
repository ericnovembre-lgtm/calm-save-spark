import { useEffect, useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UseAutoSyncOptions {
  onSync: () => Promise<void>;
  hasCachedData: boolean;
  isStale: boolean;
}

export function useAutoSync({ onSync, hasCachedData, isStale }: UseAutoSyncOptions) {
  const [isSyncing, setIsSyncing] = useState(false);
  const syncAttemptedRef = useRef(false);

  const triggerSync = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  }, [onSync, isSyncing]);

  // Auto-sync when connection restores
  useEffect(() => {
    const handleOnline = () => {
      // Only auto-sync if we have stale cached data and haven't just synced
      if (hasCachedData && isStale && !syncAttemptedRef.current) {
        syncAttemptedRef.current = true;
        toast.info('Connection restored', { 
          description: 'Syncing latest data...',
          duration: 2000
        });
        triggerSync().finally(() => {
          // Reset sync attempt flag after 30 seconds
          setTimeout(() => {
            syncAttemptedRef.current = false;
          }, 30000);
        });
      }
    };

    const handleOffline = () => {
      // Reset sync flag when going offline
      syncAttemptedRef.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasCachedData, isStale, triggerSync]);

  // Also sync when tab becomes visible after being hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' && 
        navigator.onLine && 
        hasCachedData && 
        isStale &&
        !syncAttemptedRef.current
      ) {
        syncAttemptedRef.current = true;
        triggerSync().finally(() => {
          setTimeout(() => {
            syncAttemptedRef.current = false;
          }, 30000);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasCachedData, isStale, triggerSync]);

  return {
    isSyncing,
    triggerSync
  };
}
