import { ReactNode, Suspense, lazy, ComponentType } from 'react';
import { HeavyPageSkeleton } from './skeletons/HeavyPageSkeleton';
import { MediumPageSkeleton } from './skeletons/MediumPageSkeleton';
import { LightPageSkeleton } from './skeletons/LightPageSkeleton';

type PageCategory = 'heavy' | 'medium' | 'light';

interface PageLazyLoaderProps {
  children: ReactNode;
  category?: PageCategory;
  fallback?: ReactNode;
}

const skeletonMap = {
  heavy: HeavyPageSkeleton,
  medium: MediumPageSkeleton,
  light: LightPageSkeleton,
};

/**
 * Universal lazy loader for pages with category-aware skeletons
 * Automatically selects appropriate skeleton based on page complexity
 */
export function PageLazyLoader({ 
  children, 
  category = 'medium',
  fallback 
}: PageLazyLoaderProps) {
  const SkeletonComponent = skeletonMap[category];
  
  return (
    <Suspense fallback={fallback || <SkeletonComponent />}>
      {children}
    </Suspense>
  );
}

/**
 * Create a lazy-loaded page with automatic skeleton fallback
 * Usage: const Dashboard = createPageLoader(() => import('./pages/Dashboard'), 'heavy');
 */
export function createPageLoader<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  category: PageCategory = 'medium',
  CustomSkeleton?: ComponentType
) {
  const LazyComponent = lazy(importFunc);
  const SkeletonComponent = CustomSkeleton || skeletonMap[category];
  
  return function PageWithLoader(props: any) {
    return (
      <Suspense fallback={<SkeletonComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
