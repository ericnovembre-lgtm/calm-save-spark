import { useRef, ReactNode } from 'react';
import { useIntersectionPriority } from '@/hooks/useIntersectionPriority';
import { Skeleton } from '@/components/ui/skeleton';

interface PriorityLoaderProps {
  children: ReactNode;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  fallback?: ReactNode;
  minHeight?: string;
  className?: string;
}

/**
 * Smart content loader that prioritizes above-the-fold content
 * 
 * Priority levels:
 * - critical: Loads immediately (above-the-fold hero content)
 * - high: Loads immediately (important above-the-fold content)
 * - medium: Loads when approaching viewport (default)
 * - low: Loads when entering viewport (below-the-fold)
 */
export function PriorityLoader({
  children,
  priority = 'medium',
  fallback,
  minHeight = '200px',
  className = '',
}: PriorityLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { shouldLoad } = useIntersectionPriority(containerRef, { priority });

  if (!shouldLoad) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{ minHeight }}
        aria-busy="true"
        aria-live="polite"
      >
        {fallback || <Skeleton className="w-full h-full" />}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
