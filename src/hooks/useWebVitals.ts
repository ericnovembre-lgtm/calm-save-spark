import { useEffect, useState } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';
import { trackEvent } from '@/lib/analytics-lazy';

/**
 * Enhanced Web Vitals Monitoring Hook
 * Phase 7: Monitoring & Continuous Optimization
 * 
 * Tracks Core Web Vitals + Custom Performance Metrics:
 * - LCP: Largest Contentful Paint (< 2.5s target)
 * - INP: Interaction to Next Paint (< 200ms target)
 * - CLS: Cumulative Layout Shift (< 0.1 target)
 * - FCP: First Contentful Paint (< 1.8s target)
 * - TTFB: Time to First Byte (< 600ms target)
 * - Query Time: Average React Query response time
 * - Render Time: Component render performance
 */

interface PerformanceBudget {
  LCP: number;
  INP: number;
  CLS: number;
  FCP: number;
  TTFB: number;
}

const PERFORMANCE_BUDGETS: PerformanceBudget = {
  LCP: 2500,  // 2.5s
  INP: 200,   // 200ms
  CLS: 0.1,   // 0.1
  FCP: 1800,  // 1.8s
  TTFB: 600,  // 600ms
};

interface CustomMetrics {
  queryTime: number[];
  renderTime: number[];
  bundleSize: number;
}

interface PageMetrics {
  [page: string]: {
    LCP: number[];
    INP: number[];
    CLS: number[];
    loadTime: number[];
  };
}

export const useWebVitals = (enabled: boolean = true) => {
  const [customMetrics] = useState<CustomMetrics>({
    queryTime: [],
    renderTime: [],
    bundleSize: 0,
  });
  const [pageMetrics] = useState<PageMetrics>({});

  useEffect(() => {
    if (!enabled) return;

    const currentPage = window.location.pathname;

    const reportMetric = (metric: Metric) => {
      const isOverBudget = checkPerformanceBudget(metric);
      
      // Track per-page metrics
      if (!pageMetrics[currentPage]) {
        pageMetrics[currentPage] = {
          LCP: [],
          INP: [],
          CLS: [],
          loadTime: [],
        };
      }
      
      // Store metric value for page
      const metricName = metric.name as keyof typeof pageMetrics[typeof currentPage];
      if (pageMetrics[currentPage][metricName]) {
        pageMetrics[currentPage][metricName].push(metric.value);
      }
      
      // Send to analytics with page context
      trackEvent('web_vitals', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
        metric_id: metric.id,
        metric_delta: metric.delta,
        page_url: currentPage,
        over_budget: isOverBudget,
        budget: PERFORMANCE_BUDGETS[metric.name as keyof PerformanceBudget],
      });

      // Log warnings for budget violations
      if (isOverBudget) {
        console.warn(
          `[Performance Budget] ${metric.name} exceeded budget:`,
          {
            value: metric.value,
            budget: PERFORMANCE_BUDGETS[metric.name as keyof PerformanceBudget],
            rating: metric.rating,
            page: window.location.pathname,
          }
        );
      }

      // Log in development
      if (import.meta.env.DEV) {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          budget: PERFORMANCE_BUDGETS[metric.name as keyof PerformanceBudget],
          overBudget: isOverBudget,
        });
      }
    };

    // Track Core Web Vitals
    onCLS(reportMetric);
    onINP(reportMetric);
    onLCP(reportMetric);
    onFCP(reportMetric);
    onTTFB(reportMetric);

    // Track custom performance metrics
    const perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Track long tasks (> 50ms)
        if (entry.entryType === 'longtask') {
          trackEvent('long_task', {
            duration: entry.duration,
            startTime: entry.startTime,
            page: window.location.pathname,
          });
        }

        // Track resource timing
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.duration > 1000) {
            // Track slow resources (> 1s)
            trackEvent('slow_resource', {
              name: entry.name,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize,
              type: resourceEntry.initiatorType,
            });
          }
        }
      }
    });

    // Observe long tasks and resources
    if (PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
      perfObserver.observe({ entryTypes: ['longtask'] });
    }
    if (PerformanceObserver.supportedEntryTypes?.includes('resource')) {
      perfObserver.observe({ entryTypes: ['resource'] });
    }

    return () => {
      perfObserver.disconnect();
    };
  }, [enabled, customMetrics]);

  return {
    customMetrics,
    pageMetrics,
    budgets: PERFORMANCE_BUDGETS,
  };
};

/**
 * Get performance metrics for a specific page
 */
export function getPageMetrics(page: string, pageMetrics: PageMetrics) {
  const metrics = pageMetrics[page];
  if (!metrics) return null;

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  return {
    avgLCP: avg(metrics.LCP),
    avgINP: avg(metrics.INP),
    avgCLS: avg(metrics.CLS),
    avgLoadTime: avg(metrics.loadTime),
    samples: metrics.LCP.length,
  };
}

/**
 * Check if metric exceeds performance budget
 */
function checkPerformanceBudget(metric: Metric): boolean {
  const budget = PERFORMANCE_BUDGETS[metric.name as keyof PerformanceBudget];
  if (!budget) return false;
  return metric.value > budget;
}

/**
 * Track custom query performance
 */
export function trackQueryPerformance(queryKey: string, duration: number) {
  if (duration > 500) {
    // Track slow queries (> 500ms)
    trackEvent('slow_query', {
      queryKey,
      duration,
      page: window.location.pathname,
    });
  }
}

/**
 * Track custom render performance
 */
export function trackRenderPerformance(componentName: string, duration: number) {
  if (duration > 16) {
    // Track slow renders (> 16ms = 60fps threshold)
    trackEvent('slow_render', {
      componentName,
      duration,
      page: window.location.pathname,
    });
  }
}
