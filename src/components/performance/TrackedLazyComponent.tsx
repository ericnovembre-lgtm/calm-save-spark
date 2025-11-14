import { Suspense, ReactNode } from 'react';
import { useComponentTracking } from '@/hooks/useComponentTracking';
import { Skeleton } from '@/components/ui/skeleton';

interface TrackedLazyComponentProps {
  children: ReactNode;
  componentName: string;
  fallback?: ReactNode;
  minHeight?: string;
}

/**
 * Wrapper for lazy-loaded components that tracks mount and render performance
 */
export function TrackedLazyComponent({
  children,
  componentName,
  fallback,
  minHeight = '200px',
}: TrackedLazyComponentProps) {
  // Track this component's performance
  useComponentTracking(componentName);

  return (
    <Suspense
      fallback={
        fallback || (
          <div style={{ minHeight }}>
            <Skeleton className="w-full h-full" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}
