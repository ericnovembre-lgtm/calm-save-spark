/**
 * Performance-optimized wrapper for onboarding steps
 * Implements lazy loading, memoization, and progressive rendering
 */

import { ReactNode, Suspense, memo } from 'react';
import { useOnboardingPerformance } from '@/hooks/useOnboardingPerformance';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Skeleton } from '@/components/ui/skeleton';

interface PerformanceOptimizedStepProps {
  children: ReactNode;
  stepName: string;
  fallback?: ReactNode;
  enablePerformanceTracking?: boolean;
}

const StepContent = memo(({ children }: { children: ReactNode }) => {
  return <>{children}</>;
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return prevProps.children === nextProps.children;
});

StepContent.displayName = 'StepContent';

export function PerformanceOptimizedStep({
  children,
  stepName,
  fallback,
  enablePerformanceTracking = true,
}: PerformanceOptimizedStepProps) {
  const { trackInteractionStart, trackInteractionEnd } = useOnboardingPerformance(
    stepName,
    enablePerformanceTracking
  );
  const prefersReducedMotion = useReducedMotion();

  const defaultFallback = (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-12 w-3/4 mx-auto" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-10 w-1/2 mx-auto" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <div
        data-step={stepName}
        data-reduced-motion={prefersReducedMotion}
        onPointerDown={trackInteractionStart}
        onPointerUp={trackInteractionEnd}
        className="w-full"
      >
        <StepContent>{children}</StepContent>
      </div>
    </Suspense>
  );
}

// Export memoized version
export default memo(PerformanceOptimizedStep);
