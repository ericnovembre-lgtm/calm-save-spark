/**
 * useMemoryMonitor - Track heap size and detect memory leaks
 * Only works in Chrome with performance.memory API
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemoryMetrics {
  current: number; // MB
  total: number; // MB
  limit: number; // MB
  percentage: number;
  trend: 'stable' | 'growing' | 'shrinking';
  isLeaking: boolean;
  history: number[];
}

interface UseMemoryMonitorOptions {
  /** Interval in ms between measurements (default: 5000) */
  interval?: number;
  /** Number of samples to keep for trend analysis (default: 10) */
  historySize?: number;
  /** Threshold percentage for leak warning (default: 80) */
  warningThreshold?: number;
  /** Enable console warnings (default: true in dev) */
  enableWarnings?: boolean;
}

const DEFAULT_OPTIONS: UseMemoryMonitorOptions = {
  interval: 5000,
  historySize: 10,
  warningThreshold: 80,
  enableWarnings: import.meta.env.DEV,
};

/**
 * Check if memory API is available (Chrome only)
 */
const hasMemoryAPI = (): boolean => {
  return !!(performance as any).memory;
};

/**
 * Get current memory info
 */
const getMemoryInfo = (): MemoryInfo | null => {
  if (!hasMemoryAPI()) return null;
  return (performance as any).memory;
};

/**
 * Convert bytes to megabytes
 */
const bytesToMB = (bytes: number): number => {
  return Math.round(bytes / 1024 / 1024 * 100) / 100;
};

/**
 * Analyze trend from history
 */
const analyzeTrend = (history: number[]): 'stable' | 'growing' | 'shrinking' => {
  if (history.length < 3) return 'stable';
  
  const recent = history.slice(-5);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const diff = last - first;
  const percentChange = (diff / first) * 100;
  
  if (percentChange > 10) return 'growing';
  if (percentChange < -10) return 'shrinking';
  return 'stable';
};

/**
 * Detect potential memory leak
 */
const detectLeak = (history: number[], threshold: number): boolean => {
  if (history.length < 5) return false;
  
  // Check if memory has been consistently growing
  let growingCount = 0;
  for (let i = 1; i < history.length; i++) {
    if (history[i] > history[i - 1]) {
      growingCount++;
    }
  }
  
  // If 80%+ of samples show growth, likely a leak
  const growthRate = growingCount / (history.length - 1);
  return growthRate > 0.8;
};

export function useMemoryMonitor(options: UseMemoryMonitorOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const historyRef = useRef<number[]>([]);
  
  const [metrics, setMetrics] = useState<MemoryMetrics>({
    current: 0,
    total: 0,
    limit: 0,
    percentage: 0,
    trend: 'stable',
    isLeaking: false,
    history: [],
  });

  const [isSupported] = useState(hasMemoryAPI);

  const measure = useCallback(() => {
    const info = getMemoryInfo();
    if (!info) return;

    const current = bytesToMB(info.usedJSHeapSize);
    const total = bytesToMB(info.totalJSHeapSize);
    const limit = bytesToMB(info.jsHeapSizeLimit);
    const percentage = Math.round((info.usedJSHeapSize / info.jsHeapSizeLimit) * 100);

    // Update history
    historyRef.current.push(current);
    if (historyRef.current.length > opts.historySize!) {
      historyRef.current.shift();
    }

    const trend = analyzeTrend(historyRef.current);
    const isLeaking = detectLeak(historyRef.current, opts.warningThreshold!);

    // Log warning if threshold exceeded
    if (opts.enableWarnings && percentage > opts.warningThreshold!) {
      console.warn(
        `[Memory Monitor] High memory usage: ${percentage}% (${current}MB / ${limit}MB)`,
        isLeaking ? '⚠️ Potential memory leak detected!' : ''
      );
    }

    setMetrics({
      current,
      total,
      limit,
      percentage,
      trend,
      isLeaking,
      history: [...historyRef.current],
    });
  }, [opts.historySize, opts.warningThreshold, opts.enableWarnings]);

  // Initial measurement
  useEffect(() => {
    if (!isSupported) return;
    measure();
  }, [isSupported, measure]);

  // Periodic measurements
  useEffect(() => {
    if (!isSupported) return;

    const intervalId = setInterval(measure, opts.interval);
    return () => clearInterval(intervalId);
  }, [isSupported, measure, opts.interval]);

  // Force garbage collection hint (non-blocking)
  const suggestGC = useCallback(() => {
    // Force all WeakRefs to be cleared
    if (typeof gc === 'function') {
      gc();
    }
    // Re-measure after GC
    setTimeout(measure, 100);
  }, [measure]);

  return {
    ...metrics,
    isSupported,
    measure,
    suggestGC,
  };
}

/**
 * Hook to track component memory footprint
 */
export function useComponentMemory(componentName: string) {
  const mountMemory = useRef<number>(0);
  const { current, isSupported } = useMemoryMonitor({ interval: 10000 });

  useEffect(() => {
    if (!isSupported) return;
    
    const info = getMemoryInfo();
    if (info) {
      mountMemory.current = bytesToMB(info.usedJSHeapSize);
    }

    return () => {
      const unmountInfo = getMemoryInfo();
      if (unmountInfo && import.meta.env.DEV) {
        const unmountMemory = bytesToMB(unmountInfo.usedJSHeapSize);
        const diff = unmountMemory - mountMemory.current;
        
        if (diff > 5) { // More than 5MB increase
          console.warn(
            `[Memory] Component "${componentName}" may have a memory leak:`,
            `Mount: ${mountMemory.current}MB, Unmount: ${unmountMemory}MB, Diff: +${diff.toFixed(2)}MB`
          );
        }
      }
    };
  }, [componentName, isSupported]);

  return { mountMemory: mountMemory.current, currentMemory: current };
}
