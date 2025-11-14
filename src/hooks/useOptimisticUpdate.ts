import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface OptimisticUpdateOptions<T> {
  onUpdate: () => Promise<T>;
  onRollback?: () => void;
  onSuccess?: (data: T) => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Hook for optimistic UI updates with automatic rollback on failure
 */
export function useOptimisticUpdate<T = void>() {
  const [isUpdating, setIsUpdating] = useState(false);

  const executeUpdate = useCallback(async <TData = any>(
    optimisticData: TData,
    previousData: TData,
    options: OptimisticUpdateOptions<T>
  ) => {
    setIsUpdating(true);

    try {
      // Update is already shown optimistically in the UI
      const result = await options.onUpdate();
      
      // Success feedback
      if (options.successMessage) {
        toast.success(options.successMessage, {
          duration: 2000,
        });
      }

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return { success: true, data: result };
    } catch (error) {
      // Rollback to previous state
      if (options.onRollback) {
        options.onRollback();
      }

      // Error feedback
      toast.error(options.errorMessage || 'Update failed. Changes reverted.', {
        duration: 3000,
        action: {
          label: 'Retry',
          onClick: () => executeUpdate(optimisticData, previousData, options),
        },
      });

      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return { executeUpdate, isUpdating };
}
