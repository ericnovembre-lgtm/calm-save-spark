/**
 * Performance Baseline Library
 * Phase 8: Performance Optimizations
 * 
 * Shared utilities for performance baseline management
 */

export interface PerformanceMetric {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fcp: number;
  inp: number;
}

export interface RouteBaseline {
  route: string;
  metrics: PerformanceMetric;
  sampleCount: number;
  lastUpdated: number;
  percentiles: {
    p50: PerformanceMetric;
    p75: PerformanceMetric;
    p95: PerformanceMetric;
  };
}

export interface BaselineReport {
  generatedAt: number;
  appVersion: string;
  routes: RouteBaseline[];
  summary: {
    totalRoutes: number;
    averageLCP: number;
    averageFID: number;
    averageCLS: number;
    regressionCount: number;
  };
}

// Threshold presets for different page types
export const THRESHOLD_PRESETS = {
  heavy: {
    lcp: 4000,
    fid: 200,
    cls: 0.25,
    ttfb: 1000,
    fcp: 3000,
    inp: 300,
  },
  medium: {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    ttfb: 600,
    fcp: 1800,
    inp: 200,
  },
  light: {
    lcp: 1500,
    fid: 50,
    cls: 0.05,
    ttfb: 300,
    fcp: 1000,
    inp: 100,
  },
} as const;

const STORAGE_KEY = 'performance-baselines';
const BASELINE_VERSION = 1;

/**
 * Performance Baseline Manager
 */
export class PerformanceBaseline {
  private baselines: Map<string, RouteBaseline> = new Map();
  private initialized = false;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load baselines from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.version === BASELINE_VERSION) {
          data.routes.forEach((baseline: RouteBaseline) => {
            this.baselines.set(baseline.route, baseline);
          });
        }
      }
      this.initialized = true;
    } catch (error) {
      console.warn('[PerformanceBaseline] Failed to load from storage:', error);
      this.initialized = true;
    }
  }

  /**
   * Save baselines to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        version: BASELINE_VERSION,
        routes: Array.from(this.baselines.values()),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('[PerformanceBaseline] Failed to save to storage:', error);
    }
  }

  /**
   * Record a performance sample for a route
   */
  recordSample(route: string, metrics: Partial<PerformanceMetric>): void {
    const existing = this.baselines.get(route);
    const fullMetrics: PerformanceMetric = {
      lcp: metrics.lcp ?? 0,
      fid: metrics.fid ?? 0,
      cls: metrics.cls ?? 0,
      ttfb: metrics.ttfb ?? 0,
      fcp: metrics.fcp ?? 0,
      inp: metrics.inp ?? 0,
    };

    if (existing) {
      // Update rolling average
      const count = existing.sampleCount + 1;
      const updatedMetrics: PerformanceMetric = {
        lcp: this.rollingAverage(existing.metrics.lcp, fullMetrics.lcp, count),
        fid: this.rollingAverage(existing.metrics.fid, fullMetrics.fid, count),
        cls: this.rollingAverage(existing.metrics.cls, fullMetrics.cls, count),
        ttfb: this.rollingAverage(existing.metrics.ttfb, fullMetrics.ttfb, count),
        fcp: this.rollingAverage(existing.metrics.fcp, fullMetrics.fcp, count),
        inp: this.rollingAverage(existing.metrics.inp, fullMetrics.inp, count),
      };

      this.baselines.set(route, {
        ...existing,
        metrics: updatedMetrics,
        sampleCount: count,
        lastUpdated: Date.now(),
        percentiles: this.updatePercentiles(existing.percentiles, fullMetrics),
      });
    } else {
      // Create new baseline
      this.baselines.set(route, {
        route,
        metrics: fullMetrics,
        sampleCount: 1,
        lastUpdated: Date.now(),
        percentiles: {
          p50: fullMetrics,
          p75: fullMetrics,
          p95: fullMetrics,
        },
      });
    }

    this.saveToStorage();
  }

  /**
   * Calculate rolling average
   */
  private rollingAverage(oldAvg: number, newValue: number, count: number): number {
    return oldAvg + (newValue - oldAvg) / count;
  }

  /**
   * Update percentiles (simplified exponential moving approach)
   */
  private updatePercentiles(
    existing: RouteBaseline['percentiles'],
    newMetrics: PerformanceMetric
  ): RouteBaseline['percentiles'] {
    const alpha = 0.1; // Smoothing factor
    
    const updateMetric = (old: PerformanceMetric, factor: number): PerformanceMetric => ({
      lcp: old.lcp + alpha * (newMetrics.lcp * factor - old.lcp),
      fid: old.fid + alpha * (newMetrics.fid * factor - old.fid),
      cls: old.cls + alpha * (newMetrics.cls * factor - old.cls),
      ttfb: old.ttfb + alpha * (newMetrics.ttfb * factor - old.ttfb),
      fcp: old.fcp + alpha * (newMetrics.fcp * factor - old.fcp),
      inp: old.inp + alpha * (newMetrics.inp * factor - old.inp),
    });

    return {
      p50: updateMetric(existing.p50, 1.0),
      p75: updateMetric(existing.p75, 1.1),
      p95: updateMetric(existing.p95, 1.3),
    };
  }

  /**
   * Get baseline for a route
   */
  getBaseline(route: string): RouteBaseline | undefined {
    return this.baselines.get(route);
  }

  /**
   * Check for regression against baseline
   */
  checkRegression(
    route: string,
    currentMetrics: Partial<PerformanceMetric>,
    threshold = 0.2 // 20% regression threshold
  ): { hasRegression: boolean; regressions: string[] } {
    const baseline = this.baselines.get(route);
    if (!baseline || baseline.sampleCount < 5) {
      return { hasRegression: false, regressions: [] };
    }

    const regressions: string[] = [];
    const p75 = baseline.percentiles.p75;

    if (currentMetrics.lcp && currentMetrics.lcp > p75.lcp * (1 + threshold)) {
      regressions.push(`LCP: ${currentMetrics.lcp.toFixed(0)}ms vs ${p75.lcp.toFixed(0)}ms baseline`);
    }
    if (currentMetrics.fid && currentMetrics.fid > p75.fid * (1 + threshold)) {
      regressions.push(`FID: ${currentMetrics.fid.toFixed(0)}ms vs ${p75.fid.toFixed(0)}ms baseline`);
    }
    if (currentMetrics.cls && currentMetrics.cls > p75.cls * (1 + threshold)) {
      regressions.push(`CLS: ${currentMetrics.cls.toFixed(3)} vs ${p75.cls.toFixed(3)} baseline`);
    }
    if (currentMetrics.inp && currentMetrics.inp > p75.inp * (1 + threshold)) {
      regressions.push(`INP: ${currentMetrics.inp.toFixed(0)}ms vs ${p75.inp.toFixed(0)}ms baseline`);
    }

    return {
      hasRegression: regressions.length > 0,
      regressions,
    };
  }

  /**
   * Get all baselines
   */
  getAllBaselines(): RouteBaseline[] {
    return Array.from(this.baselines.values());
  }

  /**
   * Generate a full baseline report
   */
  generateReport(appVersion = '1.0.0'): BaselineReport {
    const routes = this.getAllBaselines();
    
    const averages = routes.reduce(
      (acc, route) => ({
        lcp: acc.lcp + route.metrics.lcp,
        fid: acc.fid + route.metrics.fid,
        cls: acc.cls + route.metrics.cls,
      }),
      { lcp: 0, fid: 0, cls: 0 }
    );

    const count = routes.length || 1;

    return {
      generatedAt: Date.now(),
      appVersion,
      routes,
      summary: {
        totalRoutes: routes.length,
        averageLCP: averages.lcp / count,
        averageFID: averages.fid / count,
        averageCLS: averages.cls / count,
        regressionCount: 0, // Would need current metrics to calculate
      },
    };
  }

  /**
   * Export baselines as JSON
   */
  exportBaselines(): string {
    return JSON.stringify(this.generateReport(), null, 2);
  }

  /**
   * Import baselines from JSON
   */
  importBaselines(json: string): boolean {
    try {
      const data = JSON.parse(json) as BaselineReport;
      data.routes.forEach((baseline) => {
        this.baselines.set(baseline.route, baseline);
      });
      this.saveToStorage();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all baselines
   */
  clearBaselines(): void {
    this.baselines.clear();
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Get threshold preset for a page type
   */
  static getThresholds(pageType: 'heavy' | 'medium' | 'light'): PerformanceMetric {
    return THRESHOLD_PRESETS[pageType];
  }

  /**
   * Check if metrics meet thresholds
   */
  static meetsThresholds(
    metrics: Partial<PerformanceMetric>,
    pageType: 'heavy' | 'medium' | 'light'
  ): { passes: boolean; failures: string[] } {
    const thresholds = THRESHOLD_PRESETS[pageType];
    const failures: string[] = [];

    if (metrics.lcp && metrics.lcp > thresholds.lcp) {
      failures.push(`LCP ${metrics.lcp.toFixed(0)}ms exceeds ${thresholds.lcp}ms`);
    }
    if (metrics.fid && metrics.fid > thresholds.fid) {
      failures.push(`FID ${metrics.fid.toFixed(0)}ms exceeds ${thresholds.fid}ms`);
    }
    if (metrics.cls && metrics.cls > thresholds.cls) {
      failures.push(`CLS ${metrics.cls.toFixed(3)} exceeds ${thresholds.cls}`);
    }
    if (metrics.inp && metrics.inp > thresholds.inp) {
      failures.push(`INP ${metrics.inp.toFixed(0)}ms exceeds ${thresholds.inp}ms`);
    }

    return { passes: failures.length === 0, failures };
  }
}

// Singleton instance
export const performanceBaseline = new PerformanceBaseline();

// Convenience exports
export const recordPerformanceSample = performanceBaseline.recordSample.bind(performanceBaseline);
export const checkPerformanceRegression = performanceBaseline.checkRegression.bind(performanceBaseline);
export const getPerformanceBaseline = performanceBaseline.getBaseline.bind(performanceBaseline);
export const generatePerformanceReport = performanceBaseline.generateReport.bind(performanceBaseline);
