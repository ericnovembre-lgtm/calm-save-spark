import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { retryWithBackoff, handleError } from '@/lib/errorHandling';
import { toast } from 'sonner';

interface EdgeFunctionOptions {
  retries?: number;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface EdgeFunctionState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook for calling edge functions with automatic error handling,
 * retry logic, and user-friendly feedback.
 * 
 * @example
 * const { invoke, data, loading, error } = useEdgeFunctionCall('investment-manager');
 * 
 * const handleSync = async () => {
 *   await invoke({}, { showSuccessToast: true, successMessage: 'Portfolio synced!' });
 * };
 */
export function useEdgeFunctionCall<TResponse = any, TBody = any>(
  functionName: string
) {
  const [state, setState] = useState<EdgeFunctionState<TResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const invoke = useCallback(
    async (
      body?: TBody,
      options: EdgeFunctionOptions = {}
    ): Promise<TResponse | null> => {
      const { 
        retries = 2, 
        showSuccessToast = false, 
        successMessage = 'Operation completed successfully' 
      } = options;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await retryWithBackoff(
          async () => {
            const { data, error } = await supabase.functions.invoke<TResponse>(
              functionName,
              { body }
            );

            if (error) {
              throw error;
            }

            if (!data) {
              throw new Error('No data returned from edge function');
            }

            return data;
          },
          {
            maxRetries: retries,
            context: {
              action: `calling ${functionName}`,
              component: 'useEdgeFunctionCall',
              metadata: { functionName, hasBody: !!body }
            }
          }
        );

        setState({
          data: result,
          loading: false,
          error: null,
        });

        if (showSuccessToast) {
          toast.success(successMessage);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        
        setState({
          data: null,
          loading: false,
          error,
        });

        // Error toast is already shown by retryWithBackoff
        return null;
      }
    },
    [functionName]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    invoke,
    reset,
    ...state,
  };
}

/**
 * Specialized hook for calling edge functions that require polling
 * for long-running operations.
 * 
 * @example
 * const { start, stop, data, loading } = usePollingEdgeFunction('digital-twin-simulate');
 * 
 * const runSimulation = async () => {
 *   start({ parameters: { yearsToProject: 10 } }, {
 *     interval: 2000,
 *     maxAttempts: 30
 *   });
 * };
 */
export function usePollingEdgeFunction<TResponse = any, TBody = any>(
  functionName: string
) {
  const [state, setState] = useState<EdgeFunctionState<TResponse> & { attempts: number }>({
    data: null,
    loading: false,
    error: null,
    attempts: 0,
  });
  
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  const stop = useCallback(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setState(prev => ({ ...prev, loading: false }));
  }, [pollInterval]);

  const start = useCallback(
    async (
      body: TBody,
      options: {
        interval?: number;
        maxAttempts?: number;
        onProgress?: (attempts: number) => void;
      } = {}
    ) => {
      const { interval = 3000, maxAttempts = 20, onProgress } = options;

      setState({
        data: null,
        loading: true,
        error: null,
        attempts: 0,
      });

      let attempts = 0;

      const poll = async () => {
        attempts++;
        
        setState(prev => ({ ...prev, attempts }));
        onProgress?.(attempts);

        try {
          const { data, error } = await supabase.functions.invoke<TResponse>(
            functionName,
            { body }
          );

          if (error) {
            throw error;
          }

          if (data) {
            setState({
              data,
              loading: false,
              error: null,
              attempts,
            });
            stop();
            toast.success('Operation completed');
            return;
          }

          if (attempts >= maxAttempts) {
            throw new Error(`Maximum polling attempts (${maxAttempts}) reached`);
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          
          setState({
            data: null,
            loading: false,
            error,
            attempts,
          });

          stop();
          
          const errorResponse = handleError(error, {
            action: `polling ${functionName}`,
            component: 'usePollingEdgeFunction',
          });
          
          toast.error(errorResponse.userMessage, {
            description: errorResponse.actions[0]
          });
        }
      };

      // Start polling
      poll(); // Initial call
      const intervalId = setInterval(poll, interval);
      setPollInterval(intervalId);
    },
    [functionName, stop]
  );

  return {
    start,
    stop,
    ...state,
  };
}
