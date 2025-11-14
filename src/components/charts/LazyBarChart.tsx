/**
 * Lazy-loaded BarChart wrapper
 * Only loads recharts BarChart when component renders
 */

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const BarChartComponent = lazy(() => 
  import('recharts').then(module => ({
    default: ({ data, children, ...props }: any) => {
      const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } = module;
      return (
        <ResponsiveContainer width="100%" height={props.height || 300}>
          <BarChart data={data} {...props}>
            {children}
          </BarChart>
        </ResponsiveContainer>
      );
    }
  }))
);

interface LazyBarChartProps {
  data: any[];
  children?: React.ReactNode;
  height?: number;
  className?: string;
  [key: string]: any;
}

export function LazyBarChart({ data, children, height = 300, className, ...props }: LazyBarChartProps) {
  return (
    <Suspense fallback={
      <div className={className} style={{ height }}>
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    }>
      <BarChartComponent data={data} height={height} {...props}>
        {children}
      </BarChartComponent>
    </Suspense>
  );
}

// Export recharts components for use with LazyBarChart
export { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
