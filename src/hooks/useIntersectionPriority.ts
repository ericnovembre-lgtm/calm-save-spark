import { useEffect, useState, RefObject } from 'react';

interface IntersectionPriorityOptions {
  threshold?: number;
  rootMargin?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Hook to determine if content should load based on viewport position
 * Critical/High priority: Load immediately (above-the-fold)
 * Medium priority: Load when near viewport
 * Low priority: Load when in viewport
 */
export function useIntersectionPriority(
  ref: RefObject<Element>,
  options: IntersectionPriorityOptions = {}
) {
  const {
    threshold = 0,
    rootMargin = '0px',
    priority = 'medium',
  } = options;

  const [shouldLoad, setShouldLoad] = useState(
    priority === 'critical' || priority === 'high'
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Critical and high priority content loads immediately
    if (priority === 'critical' || priority === 'high') {
      setShouldLoad(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    // Adjust root margin based on priority
    const adjustedRootMargin = priority === 'medium' ? '400px' : '100px';

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        
        // Once content enters viewport (with margin), load it
        if (entry.isIntersecting) {
          setShouldLoad(true);
        }
      },
      {
        threshold,
        rootMargin: adjustedRootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold, rootMargin, priority]);

  return {
    shouldLoad,
    isVisible,
  };
}
