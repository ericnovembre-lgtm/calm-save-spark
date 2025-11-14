import { useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';
import { trackEvent } from '@/lib/analytics-lazy';

/**
 * Web Vitals monitoring hook
 * Tracks Core Web Vitals and sends to analytics
 * - LCP: Largest Contentful Paint
 * - INP: Interaction to Next Paint (replaces FID)
 * - CLS: Cumulative Layout Shift
 * - FCP: First Contentful Paint
 * - TTFB: Time to First Byte
 */
export const useWebVitals = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled || import.meta.env.DEV) return;

    const reportMetric = (metric: Metric) => {
      // Send to analytics
      trackEvent('web_vitals', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
        metric_id: metric.id,
        metric_delta: metric.delta,
        page_url: window.location.pathname,
      });

      // Log in development
      if (import.meta.env.DEV) {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
        });
      }
    };

    // Track Core Web Vitals
    onCLS(reportMetric);
    onINP(reportMetric); // Replaces FID in newer web-vitals
    onLCP(reportMetric);
    onFCP(reportMetric);
    onTTFB(reportMetric);
  }, [enabled]);
};
