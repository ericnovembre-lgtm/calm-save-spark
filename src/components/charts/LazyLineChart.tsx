/**
 * Lazy-loaded LineChart wrapper
 * Only loads recharts LineChart when component renders
 */

import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load only the chart components needed
const LineChartComponent = lazy(() => 
  import('recharts').then(module => ({
    default: ({ data, children, ...props }: any) => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } = module;
      return (
        <ResponsiveContainer width="100%" height={props.height || 300}>
          <LineChart data={data} {...props}>
            {children}
          </LineChart>
        </ResponsiveContainer>
      );
    }
  }))
);

interface LazyLineChartProps {
  data: any[];
  children?: React.ReactNode;
  height?: number;
  className?: string;
  [key: string]: any;
}

export function LazyLineChart({ data, children, height = 300, className, ...props }: LazyLineChartProps) {
  return (
    <Suspense fallback={
      <div className={className} style={{ height }}>
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    }>
      <LineChartComponent data={data} height={height} {...props}>
        {children}
      </LineChartComponent>
    </Suspense>
  );
}

// Export recharts components for use with LazyLineChart
export { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area } from 'recharts';
