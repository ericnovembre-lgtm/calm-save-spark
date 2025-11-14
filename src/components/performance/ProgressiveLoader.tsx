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
    if (shouldRender) return;

    // Calculate delay based on priority
    const priorityDelays = {
      high: delay,
      medium: delay + 100,
      low: delay + 300,
    };

    const effectiveDelay = priorityDelays[priority];
    const startTime = Date.now();

    // Timeout-first strategy: guarantee rendering after delay
    const timeoutId = setTimeout(() => {
      const duration = Date.now() - startTime;
      console.log(`[ProgressiveLoader] Rendering via timeout after ${duration}ms (priority: ${priority})`);
      setShouldRender(true);
    }, effectiveDelay);

    // Use requestIdleCallback opportunistically
    let idleCallbackId: number | undefined;
    if ('requestIdleCallback' in window) {
      idleCallbackId = window.requestIdleCallback(() => {
        const duration = Date.now() - startTime;
        console.log(`[ProgressiveLoader] Rendering via idle callback after ${duration}ms (priority: ${priority})`);
        clearTimeout(timeoutId);
        setShouldRender(true);
      }, { timeout: effectiveDelay });
    }

    return () => {
      clearTimeout(timeoutId);
      if (idleCallbackId !== undefined) {
        window.cancelIdleCallback(idleCallbackId);
      }
    };
  }, [delay, priority, shouldRender]);

  return shouldRender ? <>{children}</> : null;
};
