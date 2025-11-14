/**
 * Performance monitoring for onboarding flow
 * Tracks render times, interaction delays, and resource loading
 */

import { useEffect, useRef, useCallback } from 'react';
import { trackEvent } from '@/lib/analytics-lazy';

interface PerformanceMetrics {
  stepName: string;
  renderTime: number;
  interactionDelay: number;
  memoryUsage?: number;
  resourceCount: number;
}

export const useOnboardingPerformance = (stepName: string, enabled: boolean = true) => {
  const renderStartRef = useRef<number>(Date.now());
  const interactionStartRef = useRef<number | null>(null);
  const metricsRef = useRef<PerformanceMetrics>({
    stepName,
    renderTime: 0,
    interactionDelay: 0,
    resourceCount: 0,
  });

  // Track render completion
  useEffect(() => {
    if (!enabled) return;

    const renderTime = Date.now() - renderStartRef.current;
    metricsRef.current.renderTime = renderTime;

    // Get memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metricsRef.current.memoryUsage = memory.usedJSHeapSize / 1048576; // MB
    }

    // Count resources loaded for this step
    const resources = performance.getEntriesByType('resource');
    metricsRef.current.resourceCount = resources.length;

    // Track if render is slow
    if (renderTime > 1000) {
      trackEvent('onboarding_slow_render', {
        step_name: stepName,
        render_time_ms: renderTime,
        memory_mb: metricsRef.current.memoryUsage,
        resource_count: metricsRef.current.resourceCount,
      });
    }
  }, [stepName, enabled]);

  // Track interaction-to-next-paint (INP)
  const trackInteractionStart = useCallback(() => {
    if (!enabled) return;
    interactionStartRef.current = Date.now();
  }, [enabled]);

  const trackInteractionEnd = useCallback(() => {
    if (!enabled || !interactionStartRef.current) return;

    const delay = Date.now() - interactionStartRef.current;
    metricsRef.current.interactionDelay = delay;

    // Track if interaction is laggy
    if (delay > 200) {
      trackEvent('onboarding_slow_interaction', {
        step_name: stepName,
        interaction_delay_ms: delay,
      });
    }

    interactionStartRef.current = null;
  }, [stepName, enabled]);

  // Report metrics when step unmounts
  useEffect(() => {
    return () => {
      if (!enabled) return;

      trackEvent('onboarding_step_performance', {
        step_name: stepName,
        render_time_ms: metricsRef.current.renderTime,
        interaction_delay_ms: metricsRef.current.interactionDelay,
        memory_mb: metricsRef.current.memoryUsage,
        resource_count: metricsRef.current.resourceCount,
      });
    };
  }, [stepName, enabled]);

  return {
    trackInteractionStart,
    trackInteractionEnd,
    metrics: metricsRef.current,
  };
};
