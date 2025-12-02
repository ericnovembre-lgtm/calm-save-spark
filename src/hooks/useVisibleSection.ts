import { useState, useEffect, useRef } from 'react';

/**
 * useVisibleSection - Track which section is currently visible using Intersection Observer
 * Returns the ID of the currently visible section
 */
export function useVisibleSection(sectionIds: string[]) {
  const [visibleSection, setVisibleSection] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Trigger when section is in upper-middle portion
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSection(entry.target.id);
        }
      });
    }, options);

    // Observe all sections
    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    // Set initial section
    if (sectionIds.length > 0 && !visibleSection) {
      setVisibleSection(sectionIds[0]);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sectionIds]);

  return visibleSection;
}
