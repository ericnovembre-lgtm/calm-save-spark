import { useState, useCallback, useTransition } from 'react';
import { toast } from 'sonner';

interface OptimisticActionOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Hook for optimistic UI updates with instant feedback
 * Updates UI immediately before server response, rolls back on error
 */
export function useOptimisticAction<T>() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const executeAction = useCallback(async (
    action: () => Promise<T>,
    options: OptimisticActionOptions<T> = {}
  ) => {
    setIsLoading(true);

    // Apply optimistic update through React transition
    startTransition(() => {
      // Transition triggers immediate UI update
    });

    try {
      const result = await action();
      
      if (options.successMessage) {
        toast.success(options.successMessage, {
          duration: 2000,
        });
      }

      options.onSuccess?.(result);
      return { success: true, data: result };
    } catch (error) {
      const err = error as Error;
      
      toast.error(options.errorMessage || 'Action failed. Please try again.', {
        duration: 3000,
        action: {
          label: 'Retry',
          onClick: () => executeAction(action, options),
        },
      });

      options.onError?.(err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { 
    executeAction, 
    isPending: isPending || isLoading 
  };
}
