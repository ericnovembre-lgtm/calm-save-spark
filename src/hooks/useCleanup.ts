/**
 * Memory Leak Prevention Hooks
 * Automatic cleanup of subscriptions, timers, and event listeners
 */
import { useRef, useEffect, useCallback } from 'react';

type CleanupFn = () => void;

/**
 * Hook for managing multiple cleanup functions
 * All registered cleanups run on unmount
 */
export function useCleanup() {
  const cleanups = useRef<CleanupFn[]>([]);
  const intervals = useRef<ReturnType<typeof setInterval>[]>([]);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Add a cleanup function
  const addCleanup = useCallback((cleanup: CleanupFn) => {
    cleanups.current.push(cleanup);
  }, []);

  // Add an interval with automatic cleanup
  const addInterval = useCallback((fn: () => void, ms: number) => {
    const id = setInterval(fn, ms);
    intervals.current.push(id);
    return id;
  }, []);

  // Add a timeout with automatic cleanup
  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeouts.current.push(id);
    return id;
  }, []);

  // Add an event listener with automatic cleanup
  const addListener = useCallback(
    <K extends keyof WindowEventMap>(
      target: EventTarget,
      event: K | string,
      handler: EventListener,
      options?: AddEventListenerOptions
    ) => {
      target.addEventListener(event, handler, options);
      cleanups.current.push(() => target.removeEventListener(event, handler, options));
    },
    []
  );

  // Clear a specific timeout
  const clearTimeoutById = useCallback((id: ReturnType<typeof setTimeout>) => {
    clearTimeout(id);
    timeouts.current = timeouts.current.filter(t => t !== id);
  }, []);

  // Clear a specific interval
  const clearIntervalById = useCallback((id: ReturnType<typeof setInterval>) => {
    clearInterval(id);
    intervals.current = intervals.current.filter(i => i !== id);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Run all cleanup functions
      cleanups.current.forEach(cleanup => cleanup());
      cleanups.current = [];

      // Clear all intervals
      intervals.current.forEach(id => clearInterval(id));
      intervals.current = [];

      // Clear all timeouts
      timeouts.current.forEach(id => clearTimeout(id));
      timeouts.current = [];
    };
  }, []);

  return {
    addCleanup,
    addInterval,
    addTimeout,
    addListener,
    clearTimeoutById,
    clearIntervalById,
  };
}

/**
 * Safe setState that doesn't update after unmount
 */
export function useSafeState<T>(initialState: T): [T, (value: T | ((prev: T) => T)) => void] {
  const isMounted = useRef(true);
  const [state, setState] = useState(initialState);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetState = useCallback((value: T | ((prev: T) => T)) => {
    if (isMounted.current) {
      setState(value);
    }
  }, []);

  return [state, safeSetState];
}

import { useState } from 'react';

/**
 * Hook that tracks mounted state
 */
export function useIsMounted(): () => boolean {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}
