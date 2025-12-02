import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const queryClient = useQueryClient();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStatus('synced');
      // Refetch data when coming back online
      queryClient.invalidateQueries();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  // Detect when queries are fetching
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === 'observerResultsUpdated') {
        const isFetching = queryClient.isFetching() > 0;
        
        // Defer state updates to avoid setState during render
        setTimeout(() => {
          if (isFetching && isOnline) {
            setStatus('syncing');
          } else if (isOnline) {
            setStatus('synced');
            setLastSynced(new Date());
          }
        }, 0);
      }
    });

    return unsubscribe;
  }, [queryClient, isOnline]);

  const forceRefresh = useCallback(async () => {
    if (!isOnline) return;
    
    setStatus('syncing');
    try {
      await queryClient.invalidateQueries();
      setStatus('synced');
      setLastSynced(new Date());
    } catch (error) {
      console.error('Sync error:', error);
      setStatus('error');
      setTimeout(() => setStatus('synced'), 3000);
    }
  }, [queryClient, isOnline]);

  return {
    status: isOnline ? status : 'offline',
    lastSynced,
    isOnline,
    forceRefresh
  };
}
