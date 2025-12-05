/**
 * Render Profiling Hook
 * Track component render counts and duration for debugging
 */
import { useRef, useEffect, useCallback } from 'react';

interface RenderMetrics {
  renderCount: number;
  lastRenderDuration: number;
  averageRenderDuration: number;
  totalRenderTime: number;
  slowRenders: number; // renders > 16ms
}

const globalMetrics: Map<string, RenderMetrics> = new Map();

/**
 * Hook to profile component renders
 * Only active in development mode
 */
export function useRenderProfiler(componentName: string): RenderMetrics {
  const renderStartTime = useRef<number>(performance.now());
  const metricsRef = useRef<RenderMetrics>({
    renderCount: 0,
    lastRenderDuration: 0,
    averageRenderDuration: 0,
    totalRenderTime: 0,
    slowRenders: 0,
  });

  // Track render start
  renderStartTime.current = performance.now();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const duration = performance.now() - renderStartTime.current;
    const metrics = metricsRef.current;

    metrics.renderCount++;
    metrics.lastRenderDuration = duration;
    metrics.totalRenderTime += duration;
    metrics.averageRenderDuration = metrics.totalRenderTime / metrics.renderCount;
    
    if (duration > 16) {
      metrics.slowRenders++;
    }

    // Store globally for debugging
    globalMetrics.set(componentName, { ...metrics });

    // Log slow renders
    if (duration > 50) {
      console.warn(
        `[RenderProfiler] Slow render in ${componentName}: ${duration.toFixed(2)}ms`
      );
    }
  });

  return metricsRef.current;
}

/**
 * Get all component render metrics
 */
export function getAllRenderMetrics(): Map<string, RenderMetrics> {
  return new Map(globalMetrics);
}

/**
 * Reset all render metrics
 */
export function resetRenderMetrics(): void {
  globalMetrics.clear();
}

/**
 * Get metrics for a specific component
 */
export function getComponentMetrics(componentName: string): RenderMetrics | undefined {
  return globalMetrics.get(componentName);
}

/**
 * Hook to track why a component re-rendered
 */
export function useWhyDidYouRender<T extends Record<string, unknown>>(
  componentName: string,
  props: T
): void {
  const previousProps = useRef<T>();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    if (previousProps.current) {
      const changedProps: string[] = [];
      
      Object.keys(props).forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps.push(key);
        }
      });

      if (changedProps.length > 0) {
        console.log(
          `[WhyDidYouRender] ${componentName} re-rendered due to:`,
          changedProps
        );
      }
    }

    previousProps.current = { ...props };
  });
}

/**
 * Performance mark utility for custom measurements
 */
export function usePerformanceMark(componentName: string) {
  const markStart = useCallback((label: string) => {
    if (process.env.NODE_ENV === 'development') {
      performance.mark(`${componentName}-${label}-start`);
    }
  }, [componentName]);

  const markEnd = useCallback((label: string) => {
    if (process.env.NODE_ENV === 'development') {
      const startMark = `${componentName}-${label}-start`;
      const endMark = `${componentName}-${label}-end`;
      
      performance.mark(endMark);
      
      try {
        const measure = performance.measure(
          `${componentName}-${label}`,
          startMark,
          endMark
        );
        
        if (measure.duration > 16) {
          console.warn(
            `[PerformanceMark] ${componentName}.${label}: ${measure.duration.toFixed(2)}ms`
          );
        }
      } catch {
        // Marks may not exist
      }
    }
  }, [componentName]);

  return { markStart, markEnd };
}
