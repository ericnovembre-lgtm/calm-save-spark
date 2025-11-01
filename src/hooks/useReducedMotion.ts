import { useState, useEffect } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has enabled "Reduce motion" in OS settings
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    // Initial check
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener?.('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener?.('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Get animation duration based on user preference
 * Returns 0 if user prefers reduced motion, otherwise returns the provided duration
 */
export function getAnimationDuration(duration: number, prefersReducedMotion: boolean): number {
  return prefersReducedMotion ? 0 : duration;
}

/**
 * Get framer-motion transition config respecting reduced motion
 */
export function getMotionConfig(prefersReducedMotion: boolean) {
  return {
    initial: prefersReducedMotion ? false : undefined,
    animate: prefersReducedMotion ? false : undefined,
    transition: prefersReducedMotion ? { duration: 0 } : undefined,
  };
}
