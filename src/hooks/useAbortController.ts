/**
 * AbortController Hooks
 * Automatic fetch cancellation on unmount
 */
import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Hook that provides an AbortController that auto-aborts on unmount
 */
export function useAbortController(): AbortController {
  const controllerRef = useRef<AbortController>(new AbortController());

  useEffect(() => {
    // Create new controller on mount
    controllerRef.current = new AbortController();
    
    return () => {
      // Abort on unmount
      controllerRef.current.abort();
    };
  }, []);

  return controllerRef.current;
}

/**
 * Hook that provides a new AbortController for each call
 * Automatically aborts previous request when a new one starts
 */
export function useAbortableRequest(): {
  getSignal: () => AbortSignal;
  abort: () => void;
} {
  const controllerRef = useRef<AbortController | null>(null);

  const getSignal = useCallback(() => {
    // Abort previous request
    controllerRef.current?.abort();
    
    // Create new controller
    controllerRef.current = new AbortController();
    return controllerRef.current.signal;
  }, []);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return { getSignal, abort };
}

interface UseCancelableFetchOptions<T> extends RequestInit {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  transform?: (response: Response) => Promise<T>;
}

interface UseCancelableFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  abort: () => void;
}

/**
 * Fetch hook with automatic cancellation
 */
export function useCancelableFetch<T>(
  url: string | null,
  options?: UseCancelableFetchOptions<T>
): UseCancelableFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;

    // Abort previous request
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = options?.transform
        ? await options.transform(response)
        : await response.json();

      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, don't update state
        return;
      }
      const error = err instanceof Error ? err : new Error('Fetch failed');
      setError(error);
      options?.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [url, options?.transform]);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [url]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return { data, loading, error, refetch: fetchData, abort };
}

/**
 * Timeout promise that can be aborted
 */
export function abortableTimeout(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

/**
 * Race a promise against a timeout with abort support
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  signal?: AbortSignal
): Promise<T> {
  const controller = new AbortController();
  
  // Link external signal if provided
  signal?.addEventListener('abort', () => controller.abort());

  const timeoutPromise = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      controller.abort();
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
    
    controller.signal.addEventListener('abort', () => clearTimeout(id));
  });

  return Promise.race([promise, timeoutPromise]);
}
