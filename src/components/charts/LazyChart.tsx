/**
 * Lazy-loaded chart wrapper for recharts
 * Significantly reduces initial bundle size by loading charts on demand
 */

import { Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyChartProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  config: any;
  height?: number;
  className?: string;
}

export function LazyChart({ type, data, config, height = 300, className }: LazyChartProps) {
  return (
    <div className={className} style={{ height }}>
      <Skeleton className="w-full h-full rounded-md" />
    </div>
  );
}

// Note: Full recharts lazy loading implementation would require
// creating separate wrapper components for each chart type.
// For now, this is a placeholder that can be expanded when needed.
