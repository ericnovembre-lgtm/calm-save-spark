/**
 * Optimistic Mutation Hook
 * Phase 6: Backend Optimization
 * 
 * Provides instant UI updates before server confirms, with automatic rollback on error
 */

import { useCallback, useRef } from 'react';
import { useQueryClient, QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MutationType } from '@/lib/query-invalidation-rules';
import { useCacheInvalidation } from './useCacheInvalidation';

interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: QueryKey;
  mutationType?: MutationType;
  optimisticUpdate: (variables: TVariables, currentData: TData | undefined) => TData;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  successMessage?: string;
  errorMessage?: string;
  rollbackOnError?: boolean;
}

interface OptimisticMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | undefined>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  data: TData | undefined;
  reset: () => void;
}

/**
 * Hook for optimistic mutations with instant UI feedback
 */
export function useOptimisticMutation<TData, TVariables>(
  options: OptimisticMutationOptions<TData, TVariables>
): OptimisticMutationResult<TData, TVariables> {
  const {
    mutationFn,
    queryKey,
    mutationType,
    optimisticUpdate,
    onSuccess,
    onError,
    successMessage,
    errorMessage = 'Something went wrong. Changes reverted.',
    rollbackOnError = true,
  } = options;
  
  const queryClient = useQueryClient();
  const { invalidate } = useCacheInvalidation();
  
  const stateRef = useRef<{
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
    data: TData | undefined;
  }>({
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: undefined,
  });
  
  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    // Store previous data for rollback
    const previousData = queryClient.getQueryData<TData>(queryKey);
    
    stateRef.current = {
      isPending: true,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
    };
    
    // Apply optimistic update immediately
    const optimisticData = optimisticUpdate(variables, previousData);
    queryClient.setQueryData(queryKey, optimisticData);
    
    try {
      // Execute actual mutation
      const result = await mutationFn(variables);
      
      // Update with server response
      queryClient.setQueryData(queryKey, result);
      
      stateRef.current = {
        isPending: false,
        isSuccess: true,
        isError: false,
        error: null,
        data: result,
      };
      
      // Show success message
      if (successMessage) {
        toast.success(successMessage, { duration: 2000 });
      }
      
      // Invalidate related caches
      if (mutationType) {
        invalidate(mutationType, { immediate: false, refetchActive: false });
      }
      
      onSuccess?.(result, variables);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mutation failed');
      
      stateRef.current = {
        isPending: false,
        isSuccess: false,
        isError: true,
        error,
        data: undefined,
      };
      
      // Rollback to previous data
      if (rollbackOnError && previousData !== undefined) {
        queryClient.setQueryData(queryKey, previousData);
      }
      
      // Show error message with retry option
      toast.error(errorMessage, {
        duration: 4000,
        action: {
          label: 'Retry',
          onClick: () => mutateAsync(variables),
        },
      });
      
      onError?.(error, variables);
      
      throw error;
    }
  }, [
    queryClient,
    queryKey,
    mutationFn,
    optimisticUpdate,
    mutationType,
    invalidate,
    successMessage,
    errorMessage,
    rollbackOnError,
    onSuccess,
    onError,
  ]);
  
  const mutate = useCallback(async (variables: TVariables): Promise<TData | undefined> => {
    try {
      return await mutateAsync(variables);
    } catch {
      return undefined;
    }
  }, [mutateAsync]);
  
  const reset = useCallback(() => {
    stateRef.current = {
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
    };
  }, []);
  
  return {
    mutate,
    mutateAsync,
    isPending: stateRef.current.isPending,
    isSuccess: stateRef.current.isSuccess,
    isError: stateRef.current.isError,
    error: stateRef.current.error,
    data: stateRef.current.data,
    reset,
  };
}

/**
 * Simplified hook for optimistic list mutations (add/remove/update items)
 */
export function useOptimisticListMutation<TItem extends { id: string }>(options: {
  queryKey: QueryKey;
  mutationType?: MutationType;
  addFn?: (item: Omit<TItem, 'id'>) => Promise<TItem>;
  updateFn?: (item: TItem) => Promise<TItem>;
  removeFn?: (id: string) => Promise<void>;
}) {
  const { queryKey, mutationType, addFn, updateFn, removeFn } = options;
  const queryClient = useQueryClient();
  const { invalidate } = useCacheInvalidation();
  
  const addItem = useCallback(async (item: Omit<TItem, 'id'>) => {
    if (!addFn) throw new Error('addFn not provided');
    
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { ...item, id: tempId } as TItem;
    
    // Optimistic add
    queryClient.setQueryData<TItem[]>(queryKey, (old = []) => [...old, optimisticItem]);
    
    try {
      const result = await addFn(item);
      
      // Replace temp item with real item
      queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
        old.map(i => i.id === tempId ? result : i)
      );
      
      if (mutationType) invalidate(mutationType);
      
      return result;
    } catch (err) {
      // Rollback
      queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
        old.filter(i => i.id !== tempId)
      );
      throw err;
    }
  }, [queryClient, queryKey, addFn, mutationType, invalidate]);
  
  const updateItem = useCallback(async (item: TItem) => {
    if (!updateFn) throw new Error('updateFn not provided');
    
    const previousData = queryClient.getQueryData<TItem[]>(queryKey);
    
    // Optimistic update
    queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
      old.map(i => i.id === item.id ? item : i)
    );
    
    try {
      const result = await updateFn(item);
      
      queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
        old.map(i => i.id === item.id ? result : i)
      );
      
      if (mutationType) invalidate(mutationType);
      
      return result;
    } catch (err) {
      // Rollback
      if (previousData) queryClient.setQueryData(queryKey, previousData);
      throw err;
    }
  }, [queryClient, queryKey, updateFn, mutationType, invalidate]);
  
  const removeItem = useCallback(async (id: string) => {
    if (!removeFn) throw new Error('removeFn not provided');
    
    const previousData = queryClient.getQueryData<TItem[]>(queryKey);
    
    // Optimistic remove
    queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
      old.filter(i => i.id !== id)
    );
    
    try {
      await removeFn(id);
      
      if (mutationType) invalidate(mutationType);
    } catch (err) {
      // Rollback
      if (previousData) queryClient.setQueryData(queryKey, previousData);
      throw err;
    }
  }, [queryClient, queryKey, removeFn, mutationType, invalidate]);
  
  return { addItem, updateItem, removeItem };
}
