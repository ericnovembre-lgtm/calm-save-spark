/**
 * Lazy-loaded AreaChart wrapper
 * Only loads recharts AreaChart when component renders
 */

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AreaChartComponent = lazy(() => 
  import('recharts').then(module => ({
    default: ({ data, children, ...props }: any) => {
      const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } = module;
      return (
        <ResponsiveContainer width="100%" height={props.height || 300}>
          <AreaChart data={data} {...props}>
            {children}
          </AreaChart>
        </ResponsiveContainer>
      );
    }
  }))
);

interface LazyAreaChartProps {
  data: any[];
  children?: React.ReactNode;
  height?: number;
  className?: string;
  [key: string]: any;
}

export function LazyAreaChart({ data, children, height = 300, className, ...props }: LazyAreaChartProps) {
  return (
    <Suspense fallback={
      <div className={className} style={{ height }}>
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    }>
      <AreaChartComponent data={data} height={height} {...props}>
        {children}
      </AreaChartComponent>
    </Suspense>
  );
}

// Export recharts components for use with LazyAreaChart
export { Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
