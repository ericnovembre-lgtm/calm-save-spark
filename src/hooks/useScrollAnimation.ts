import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Hook for scroll-linked animations
 * Returns transform values based on scroll position
 */
export function useScrollAnimation(ref: RefObject<HTMLElement>) {
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Disable animations if user prefers reduced motion
  if (prefersReducedMotion) {
    return {
      opacity: 1,
      y: 0,
      scale: 1,
      scrollYProgress: { get: () => 1 } as MotionValue<number>,
    };
  }

  // Fade in as element enters viewport
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  
  // Slide up effect
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [50, 0, 0, -50]);
  
  // Subtle scale effect
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  return {
    opacity,
    y,
    scale,
    scrollYProgress,
  };
}

/**
 * Smooth scroll to element with offset
 */
export function smoothScrollTo(elementId: string, offset: number = 0) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const targetPosition = element.offsetTop - offset;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  });
}

/**
 * Hook for parallax scroll effect
 */
export function useParallaxScroll(speed: number = 0.5) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  if (prefersReducedMotion) {
    return 0;
  }

  return useTransform(scrollY, (value) => value * speed);
}
