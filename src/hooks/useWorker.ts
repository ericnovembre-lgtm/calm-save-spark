/**
 * Web Worker Hook
 * Offload expensive calculations to background threads
 */
import { useState, useCallback, useRef, useEffect } from 'react';

interface WorkerState<R> {
  result: R | null;
  error: Error | null;
  isRunning: boolean;
}

/**
 * Create and manage a web worker for heavy computations
 */
export function useWorker<T, R>(
  workerFn: (data: T) => R
): {
  run: (data: T) => Promise<R>;
  result: R | null;
  error: Error | null;
  isRunning: boolean;
  terminate: () => void;
} {
  const [state, setState] = useState<WorkerState<R>>({
    result: null,
    error: null,
    isRunning: false,
  });
  
  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((value: R) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);

  // Create worker blob from function
  const createWorker = useCallback(() => {
    const fnString = workerFn.toString();
    const blob = new Blob(
      [
        `
        self.onmessage = function(e) {
          try {
            const fn = ${fnString};
            const result = fn(e.data);
            self.postMessage({ type: 'success', result });
          } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
          }
        };
      `,
      ],
      { type: 'application/javascript' }
    );
    return new Worker(URL.createObjectURL(blob));
  }, [workerFn]);

  const run = useCallback(
    (data: T): Promise<R> => {
      return new Promise((resolve, reject) => {
        // Terminate existing worker
        if (workerRef.current) {
          workerRef.current.terminate();
        }

        setState(prev => ({ ...prev, isRunning: true, error: null }));
        resolveRef.current = resolve;
        rejectRef.current = reject;

        try {
          const worker = createWorker();
          workerRef.current = worker;

          worker.onmessage = (e: MessageEvent) => {
            if (e.data.type === 'success') {
              setState({ result: e.data.result, error: null, isRunning: false });
              resolveRef.current?.(e.data.result);
            } else {
              const error = new Error(e.data.error);
              setState({ result: null, error, isRunning: false });
              rejectRef.current?.(error);
            }
            worker.terminate();
          };

          worker.onerror = (error: ErrorEvent) => {
            const err = new Error(error.message);
            setState({ result: null, error: err, isRunning: false });
            rejectRef.current?.(err);
            worker.terminate();
          };

          worker.postMessage(data);
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Worker creation failed');
          setState({ result: null, error: err, isRunning: false });
          reject(err);
        }
      });
    },
    [createWorker]
  );

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setState(prev => ({ ...prev, isRunning: false }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  return {
    run,
    result: state.result,
    error: state.error,
    isRunning: state.isRunning,
    terminate,
  };
}

/**
 * Run a function in a web worker (one-shot)
 */
export function runInWorker<T, R>(fn: (data: T) => R, data: T): Promise<R> {
  return new Promise((resolve, reject) => {
    const fnString = fn.toString();
    const blob = new Blob(
      [
        `
        self.onmessage = function(e) {
          try {
            const fn = ${fnString};
            const result = fn(e.data);
            self.postMessage({ type: 'success', result });
          } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
          }
        };
      `,
      ],
      { type: 'application/javascript' }
    );
    
    const worker = new Worker(URL.createObjectURL(blob));
    
    worker.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'success') {
        resolve(e.data.result);
      } else {
        reject(new Error(e.data.error));
      }
      worker.terminate();
    };
    
    worker.onerror = (error: ErrorEvent) => {
      reject(new Error(error.message));
      worker.terminate();
    };
    
    worker.postMessage(data);
  });
}

/**
 * Check if Web Workers are supported
 */
export function supportsWebWorkers(): boolean {
  return typeof Worker !== 'undefined';
}
