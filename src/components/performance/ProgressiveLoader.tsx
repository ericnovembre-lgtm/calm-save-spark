import { useEffect, useState, ReactNode } from 'react';

interface ProgressiveLoaderProps {
  children: ReactNode;
  delay?: number;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Progressive loader that delays rendering based on priority
 * Ensures core content loads first, then progressive enhancement
 */
export const ProgressiveLoader = ({
  children,
  delay = 0,
  priority = 'medium',
}: ProgressiveLoaderProps) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Calculate delay based on priority
    const priorityDelays = {
      high: delay,
      medium: delay + 100,
      low: delay + 300,
    };

    const effectiveDelay = priorityDelays[priority];

    // Timeout-first strategy: guarantee rendering after delay
    const timeout = setTimeout(() => {
      setShouldRender(true);
    }, effectiveDelay);

    // Use requestIdleCallback as opportunistic hint, but timeout is the guarantee
    let idleCallback: number | undefined;
    if ('requestIdleCallback' in window) {
      idleCallback = requestIdleCallback(() => {
        clearTimeout(timeout);
        setShouldRender(true);
      });
    }

    return () => {
      clearTimeout(timeout);
      if (idleCallback !== undefined) {
        cancelIdleCallback(idleCallback);
      }
    };
  }, [delay, priority]);

  return shouldRender ? <>{children}</> : null;
};
