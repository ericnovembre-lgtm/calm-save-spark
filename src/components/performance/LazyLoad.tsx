import { useEffect, useRef, useState, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  minHeight?: string;
}

/**
 * LazyLoad component using Intersection Observer
 * Loads content only when it enters the viewport
 */
export const LazyLoad = ({
  children,
  fallback,
  rootMargin = '50px',
  threshold = 0.01,
  className = '',
  minHeight = '200px',
}: LazyLoadProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootMargin, threshold]);

  return (
    <div ref={containerRef} className={className} style={{ minHeight: isVisible ? 'auto' : minHeight }}>
      {isVisible ? (
        children
      ) : (
        fallback || <Skeleton className="w-full h-full" style={{ minHeight }} />
      )}
    </div>
  );
};
