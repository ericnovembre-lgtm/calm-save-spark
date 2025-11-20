import { useState, useCallback } from 'react';

export function useNotificationBadge() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount((prev) => Math.max(0, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  const setCountDirectly = useCallback((newCount: number) => {
    setCount(Math.max(0, newCount));
  }, []);

  return {
    count,
    increment,
    decrement,
    reset,
    setCount: setCountDirectly,
  };
}
