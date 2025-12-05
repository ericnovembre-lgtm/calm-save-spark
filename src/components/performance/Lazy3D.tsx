/**
 * Lazy3D - Wrapper that lazy-loads Three.js components only when visible
 * Reduces initial bundle size by deferring heavy 3D imports
 */
import { Suspense, lazy, useState, useEffect, useRef, ReactNode, ComponentType } from 'react';
import { useInView } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Lazy3DProps {
  /** Factory function returning the dynamic import */
  loader: () => Promise<{ default: ComponentType<any> }>;
  /** Props to pass to the loaded component */
  componentProps?: Record<string, any>;
  /** Fallback shown while loading */
  fallback?: ReactNode;
  /** CSS classes for wrapper */
  className?: string;
  /** Height of the 3D container */
  height?: number | string;
  /** Whether to show 2D fallback on low-end devices */
  fallbackTo2D?: boolean;
  /** Custom 2D fallback component */
  fallback2D?: ReactNode;
}

/**
 * Detect if device can handle 3D graphics
 */
const canRender3D = (): boolean => {
  // Check for WebGL support
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return false;
    
    // Check for low memory devices
    if ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) {
      return false;
    }
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Default 3D loading skeleton
 */
function Default3DSkeleton({ height }: { height: number | string }) {
  return (
    <div 
      className="relative overflow-hidden rounded-lg bg-slate-900/50"
      style={{ height }}
    >
      <Skeleton className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <span className="text-xs text-muted-foreground">Loading 3D...</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Default 2D fallback for low-end devices
 */
function Default2DFallback({ height }: { height: number | string }) {
  return (
    <div 
      className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-900"
      style={{ height }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-2xl">🎨</span>
          </div>
          <span className="text-xs text-muted-foreground">3D disabled for performance</span>
        </div>
      </div>
    </div>
  );
}

export function Lazy3D({
  loader,
  componentProps = {},
  fallback,
  className,
  height = 300,
  fallbackTo2D = true,
  fallback2D,
}: Lazy3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '100px' });
  const [Component, setComponent] = useState<ComponentType<any> | null>(null);
  const [canRender, setCanRender] = useState(true);
  const [error, setError] = useState(false);

  // Check GPU capability on mount
  useEffect(() => {
    setCanRender(canRender3D());
  }, []);

  // Load component when in view
  useEffect(() => {
    if (!isInView || !canRender || Component) return;

    loader()
      .then((mod) => setComponent(() => mod.default))
      .catch(() => setError(true));
  }, [isInView, canRender, loader, Component]);

  // Show 2D fallback for low-end devices
  if (fallbackTo2D && !canRender) {
    return (
      <div ref={ref} className={cn('relative', className)}>
        {fallback2D || <Default2DFallback height={height} />}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div ref={ref} className={cn('relative', className)}>
        <Default2DFallback height={height} />
      </div>
    );
  }

  return (
    <div ref={ref} className={cn('relative', className)} style={{ minHeight: height }}>
      {isInView && Component ? (
        <Suspense fallback={fallback || <Default3DSkeleton height={height} />}>
          <Component {...componentProps} />
        </Suspense>
      ) : (
        fallback || <Default3DSkeleton height={height} />
      )}
    </div>
  );
}

/**
 * Higher-order component to wrap 3D components with lazy loading
 */
export function withLazy3D<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options: Omit<Lazy3DProps, 'loader' | 'componentProps'> = {}
) {
  return function Lazy3DWrapper(props: P) {
    return (
      <Lazy3D
        loader={loader}
        componentProps={props}
        {...options}
      />
    );
  };
}

/**
 * Hook to check if 3D rendering is supported
 */
export function use3DSupport() {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(canRender3D());
  }, []);

  return supported;
}
