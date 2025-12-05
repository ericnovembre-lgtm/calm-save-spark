/**
 * useOfflineMutation Hook
 * React Query wrapper that handles offline mutations with background sync
 */

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient, UseMutationOptions, MutationFunction } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  queueMutation,
  registerBackgroundSync,
  getQueueStatus,
  onSyncComplete,
  isOnline,
  QueuedMutation,
  QueueStatus,
} from '@/lib/offline-mutation-queue';

export type MutationType = QueuedMutation['type'];
export type MutationAction = QueuedMutation['action'];

interface OfflineMutationOptions<TData, TError, TVariables, TContext> 
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> {
  mutationFn: MutationFunction<TData, TVariables>;
  type: MutationType;
  action: MutationAction;
  endpoint: string;
  // Keys to invalidate on success
  invalidateKeys?: string[][];
  // Optimistic update function
  optimisticUpdate?: (variables: TVariables) => void;
  // Rollback function for failed mutations
  rollback?: (variables: TVariables, context: TContext | undefined) => void;
}

interface UseOfflineMutationResult<TData, TError, TVariables, TContext> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  error: TError | null;
  isOffline: boolean;
  isPending: boolean; // Has queued mutations
  queueStatus: QueueStatus | null;
  manualSync: () => Promise<void>;
}

export function useOfflineMutation<
  TData = unknown,
  TError = Error,
  TVariables = unknown,
  TContext = unknown
>(
  options: OfflineMutationOptions<TData, TError, TVariables, TContext>
): UseOfflineMutationResult<TData, TError, TVariables, TContext> {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Refresh queue status periodically
  useEffect(() => {
    const refreshStatus = async () => {
      const status = await getQueueStatus();
      setQueueStatus(status);
    };
    
    refreshStatus();
    const interval = setInterval(refreshStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Listen for sync completion
  useEffect(() => {
    const cleanup = onSyncComplete((success, syncedCount) => {
      if (success && syncedCount > 0) {
        toast({
          title: 'Synced',
          description: `${syncedCount} change${syncedCount > 1 ? 's' : ''} synced successfully`,
        });
        
        // Invalidate relevant queries
        if (options.invalidateKeys) {
          options.invalidateKeys.forEach(key => {
            queryClient.invalidateQueries({ queryKey: key });
          });
        }
      }
      
      // Refresh queue status
      getQueueStatus().then(setQueueStatus);
    });
    
    return cleanup;
  }, [toast, queryClient, options.invalidateKeys]);
  
  // Provide Supabase config to service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'SET_SUPABASE_CONFIG',
          url: import.meta.env.VITE_SUPABASE_URL,
          key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        });
      });
    }
  }, []);
  
  // Create the mutation with offline handling
  const mutation = useMutation<TData, TError, TVariables, TContext>({
    mutationFn: async (variables: TVariables) => {
      // If online, execute normally
      if (isOnline()) {
        return options.mutationFn(variables);
      }
      
      // If offline, queue the mutation
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      await queueMutation(
        options.type,
        options.action,
        options.endpoint,
        variables as Record<string, unknown>,
        user.id
      );
      
      // Register background sync
      await registerBackgroundSync(`${options.type}-sync`);
      
      // Show offline notification
      toast({
        title: 'Saved offline',
        description: 'Your changes will sync when you\'re back online',
      });
      
      // Return optimistic data or throw to trigger rollback
      throw new OfflineQueuedError('Mutation queued for background sync');
    },
    
    onMutate: async (variables) => {
      // Apply optimistic update if provided
      if (options.optimisticUpdate) {
        options.optimisticUpdate(variables);
      }
      
      // Call original onMutate if provided
      if (options.onMutate) {
        return options.onMutate(variables);
      }
    },
    
    onError: (error, variables, context) => {
      // Don't show error for offline queued mutations
      if (error instanceof OfflineQueuedError) {
        return;
      }
      
      // Rollback optimistic update
      if (options.rollback) {
        options.rollback(variables, context);
      }
      
      // Call original onError if provided
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    
    onSuccess: (data, variables, context) => {
      // Invalidate queries
      if (options.invalidateKeys) {
        options.invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      
      // Call original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    
    onSettled: options.onSettled,
  });
  
  // Manual sync trigger
  const manualSync = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({ type: 'MANUAL_SYNC' });
    }
  }, []);
  
  return {
    mutate: mutation.mutate,
    mutateAsync: async (variables: TVariables) => {
      try {
        return await mutation.mutateAsync(variables);
      } catch (error) {
        if (error instanceof OfflineQueuedError) {
          // Return undefined for offline mutations
          return undefined as unknown as TData;
        }
        throw error;
      }
    },
    isLoading: mutation.isPending,
    isError: mutation.isError && !(mutation.error instanceof OfflineQueuedError),
    error: mutation.error instanceof OfflineQueuedError ? null : mutation.error,
    isOffline,
    isPending: (queueStatus?.pendingCount ?? 0) > 0,
    queueStatus,
    manualSync,
  };
}

/**
 * Custom error class for offline queued mutations
 */
class OfflineQueuedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OfflineQueuedError';
  }
}

/**
 * Hook to get offline queue status only
 */
export function useOfflineQueueStatus() {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    const refresh = async () => {
      const s = await getQueueStatus();
      setStatus(s);
    };
    
    refresh();
    const interval = setInterval(refresh, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { status, isOffline };
}
