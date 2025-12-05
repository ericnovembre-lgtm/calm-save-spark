/**
 * usePerformanceBaseline - Track and compare performance metrics over time
 * Detects regressions and improvements
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

interface RouteBaseline {
  lcp: number[];
  fid: number[];
  cls: number[];
  ttfb: number[];
  inp: number[];
  sampleCount: number;
  lastUpdated: number;
}

interface PerformanceAlert {
  metric: string;
  route: string;
  current: number;
  baseline: number;
  percentChange: number;
  severity: 'warning' | 'critical';
  timestamp: number;
}

interface UsePerformanceBaselineOptions {
  /** Minimum samples before comparing (default: 5) */
  minSamples?: number;
  /** Warning threshold percentage (default: 20) */
  warningThreshold?: number;
  /** Critical threshold percentage (default: 50) */
  criticalThreshold?: number;
  /** Max age for baseline data in days (default: 7) */
  maxAgeInDays?: number;
  /** Enable alerts (default: true in dev) */
  enableAlerts?: boolean;
}

const DEFAULT_OPTIONS: UsePerformanceBaselineOptions = {
  minSamples: 5,
  warningThreshold: 20,
  criticalThreshold: 50,
  maxAgeInDays: 7,
  enableAlerts: import.meta.env.DEV,
};

const STORAGE_KEY = 'performance_baselines';
const ALERT_STORAGE_KEY = 'performance_alerts';

/**
 * Get baselines from localStorage
 */
const getBaselines = (): Record<string, RouteBaseline> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

/**
 * Save baselines to localStorage
 */
const saveBaselines = (baselines: Record<string, RouteBaseline>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(baselines));
  } catch (e) {
    console.warn('[Performance Baseline] Failed to save baselines:', e);
  }
};

/**
 * Calculate average of array
 */
const average = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

/**
 * Calculate percentile
 */
const percentile = (arr: number[], p: number): number => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
};

export function usePerformanceBaseline(options: UsePerformanceBaselineOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const location = useLocation();
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const metricsBuffer = useRef<Record<string, PerformanceMetric[]>>({});

  // Record a metric
  const recordMetric = useCallback((name: string, value: number) => {
    const route = location.pathname;
    const key = `${route}:${name}`;
    
    if (!metricsBuffer.current[key]) {
      metricsBuffer.current[key] = [];
    }
    
    metricsBuffer.current[key].push({
      name,
      value,
      timestamp: Date.now(),
    });
  }, [location.pathname]);

  // Flush metrics to baseline
  const flushMetrics = useCallback(() => {
    const route = location.pathname;
    const baselines = getBaselines();
    
    // Initialize baseline for route if needed
    if (!baselines[route]) {
      baselines[route] = {
        lcp: [],
        fid: [],
        cls: [],
        ttfb: [],
        inp: [],
        sampleCount: 0,
        lastUpdated: Date.now(),
      };
    }

    const baseline = baselines[route];
    const maxAge = opts.maxAgeInDays! * 24 * 60 * 60 * 1000;
    
    // Clean old data
    if (Date.now() - baseline.lastUpdated > maxAge) {
      baseline.lcp = [];
      baseline.fid = [];
      baseline.cls = [];
      baseline.ttfb = [];
      baseline.inp = [];
      baseline.sampleCount = 0;
    }

    // Process buffered metrics
    Object.entries(metricsBuffer.current).forEach(([key, metrics]) => {
      if (!key.startsWith(route)) return;
      
      const metricName = key.split(':')[1].toLowerCase();
      const values = metrics.map(m => m.value);
      
      if (metricName in baseline) {
        (baseline as any)[metricName].push(...values);
        
        // Keep only last 50 samples
        if ((baseline as any)[metricName].length > 50) {
          (baseline as any)[metricName] = (baseline as any)[metricName].slice(-50);
        }
      }
    });

    baseline.sampleCount++;
    baseline.lastUpdated = Date.now();
    
    saveBaselines(baselines);
    metricsBuffer.current = {};
  }, [location.pathname, opts.maxAgeInDays]);

  // Check for regressions
  const checkRegressions = useCallback((currentMetrics: Record<string, number>) => {
    const route = location.pathname;
    const baselines = getBaselines();
    const baseline = baselines[route];
    
    if (!baseline || baseline.sampleCount < opts.minSamples!) {
      return [];
    }

    const newAlerts: PerformanceAlert[] = [];

    Object.entries(currentMetrics).forEach(([metric, current]) => {
      const metricKey = metric.toLowerCase();
      const baselineValues = (baseline as any)[metricKey] as number[] | undefined;
      
      if (!baselineValues || baselineValues.length === 0) return;
      
      // Use p75 as baseline comparison
      const baselineP75 = percentile(baselineValues, 75);
      const percentChange = ((current - baselineP75) / baselineP75) * 100;
      
      if (percentChange > opts.criticalThreshold!) {
        newAlerts.push({
          metric,
          route,
          current,
          baseline: baselineP75,
          percentChange,
          severity: 'critical',
          timestamp: Date.now(),
        });
      } else if (percentChange > opts.warningThreshold!) {
        newAlerts.push({
          metric,
          route,
          current,
          baseline: baselineP75,
          percentChange,
          severity: 'warning',
          timestamp: Date.now(),
        });
      }
    });

    if (newAlerts.length > 0 && opts.enableAlerts) {
      newAlerts.forEach(alert => {
        const emoji = alert.severity === 'critical' ? '🚨' : '⚠️';
        console.warn(
          `${emoji} [Performance] ${alert.metric} regression on ${alert.route}:`,
          `${alert.current.toFixed(2)}ms vs baseline ${alert.baseline.toFixed(2)}ms`,
          `(+${alert.percentChange.toFixed(1)}%)`
        );
      });
    }

    setAlerts(prev => [...prev, ...newAlerts].slice(-20));
    return newAlerts;
  }, [location.pathname, opts]);

  // Get baseline stats for current route
  const getBaselineStats = useCallback(() => {
    const route = location.pathname;
    const baselines = getBaselines();
    const baseline = baselines[route];
    
    if (!baseline) return null;

    return {
      lcp: { avg: average(baseline.lcp), p75: percentile(baseline.lcp, 75) },
      fid: { avg: average(baseline.fid), p75: percentile(baseline.fid, 75) },
      cls: { avg: average(baseline.cls), p75: percentile(baseline.cls, 75) },
      ttfb: { avg: average(baseline.ttfb), p75: percentile(baseline.ttfb, 75) },
      inp: { avg: average(baseline.inp), p75: percentile(baseline.inp, 75) },
      sampleCount: baseline.sampleCount,
      lastUpdated: baseline.lastUpdated,
    };
  }, [location.pathname]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Clear all baselines
  const clearBaselines = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAlerts([]);
  }, []);

  // Auto-flush on route change
  useEffect(() => {
    return () => {
      flushMetrics();
    };
  }, [location.pathname, flushMetrics]);

  return {
    recordMetric,
    flushMetrics,
    checkRegressions,
    getBaselineStats,
    alerts,
    clearAlerts,
    clearBaselines,
  };
}
