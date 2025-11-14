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

    // Wait for idle time or fallback to timeout
    if ('requestIdleCallback' in window) {
      const idleCallback = requestIdleCallback(
        () => {
          setShouldRender(true);
        },
        { timeout: effectiveDelay + 1000 }
      );

      return () => cancelIdleCallback(idleCallback);
    } else {
      const timeout = setTimeout(() => {
        setShouldRender(true);
      }, effectiveDelay);

      return () => clearTimeout(timeout);
    }
  }, [delay, priority]);

  return shouldRender ? <>{children}</> : null;
};
