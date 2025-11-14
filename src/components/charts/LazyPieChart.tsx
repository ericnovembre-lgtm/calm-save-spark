/**
 * Lazy-loaded PieChart wrapper
 * Only loads recharts PieChart when component renders
 */

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const PieChartComponent = lazy(() => 
  import('recharts').then(module => ({
    default: ({ children, ...props }: any) => {
      const { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } = module;
      return (
        <ResponsiveContainer width="100%" height={props.height || 300}>
          <PieChart {...props}>
            {children}
          </PieChart>
        </ResponsiveContainer>
      );
    }
  }))
);

interface LazyPieChartProps {
  children?: React.ReactNode;
  height?: number;
  className?: string;
  [key: string]: any;
}

export function LazyPieChart({ children, height = 300, className, ...props }: LazyPieChartProps) {
  return (
    <Suspense fallback={
      <div className={className} style={{ height }}>
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    }>
      <PieChartComponent height={height} {...props}>
        {children}
      </PieChartComponent>
    </Suspense>
  );
}

// Export recharts components for use with LazyPieChart
export { Pie, Cell, Tooltip, Legend } from 'recharts';
