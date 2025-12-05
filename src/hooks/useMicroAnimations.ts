import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpring, useMotionValue, useTransform, MotionValue } from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';

/**
 * Flash animation on value change
 */
export function useFlashOnChange<T>(
  value: T,
  options?: { flashDuration?: number }
): { isFlashing: boolean; flashType: 'positive' | 'negative' | null } {
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashType, setFlashType] = useState<'positive' | 'negative' | null>(null);
  const previousValue = useRef<T>(value);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const prevNum = typeof previousValue.current === 'number' ? previousValue.current : 0;
    const currNum = typeof value === 'number' ? value : 0;

    if (prevNum !== currNum && previousValue.current !== undefined) {
      setIsFlashing(true);
      setFlashType(currNum > prevNum ? 'positive' : 'negative');

      const timeout = setTimeout(() => {
        setIsFlashing(false);
        setFlashType(null);
      }, options?.flashDuration || 600);

      previousValue.current = value;
      return () => clearTimeout(timeout);
    }

    previousValue.current = value;
  }, [value, options?.flashDuration, prefersReducedMotion]);

  return { isFlashing, flashType };
}

/**
 * Smooth animated counter with spring physics
 */
export function useAnimatedCounter(
  targetValue: number,
  options?: {
    duration?: number;
    decimals?: number;
    stiffness?: number;
    damping?: number;
  }
): MotionValue<number> {
  const prefersReducedMotion = useReducedMotion();

  const springConfig = {
    stiffness: options?.stiffness || 100,
    damping: options?.damping || 30,
  };

  const motionValue = useSpring(
    prefersReducedMotion ? targetValue : 0,
    springConfig
  );

  useEffect(() => {
    motionValue.set(targetValue);
  }, [targetValue, motionValue]);

  return motionValue;
}

/**
 * 3D tilt effect following mouse position
 */
export function useTiltEffect(
  ref: React.RefObject<HTMLElement>,
  intensity: number = 10
): { rotateX: MotionValue<number>; rotateY: MotionValue<number> } {
  const prefersReducedMotion = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  useEffect(() => {
    if (!ref.current || prefersReducedMotion) return;

    const element = ref.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const tiltX = (mouseY / (rect.height / 2)) * -intensity;
      const tiltY = (mouseX / (rect.width / 2)) * intensity;

      rotateX.set(tiltX);
      rotateY.set(tiltY);
    };

    const handleMouseLeave = () => {
      rotateX.set(0);
      rotateY.set(0);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, intensity, rotateX, rotateY, prefersReducedMotion]);

  return { rotateX, rotateY };
}

/**
 * Staggered reveal animation for children
 */
export function useStaggeredReveal(
  childCount: number,
  options?: { delay?: number; staggerDelay?: number }
): { isVisible: boolean; getDelay: (index: number) => number } {
  const [isVisible, setIsVisible] = useState(false);
  const delay = options?.delay || 100;
  const staggerDelay = options?.staggerDelay || 50;

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  const getDelay = useCallback(
    (index: number) => index * staggerDelay,
    [staggerDelay]
  );

  return { isVisible, getDelay };
}

/**
 * Celebration trigger for achievements
 */
export function useCelebrationTrigger(
  condition: boolean,
  type: 'confetti' | 'coins' | 'trophy' = 'confetti'
): { shouldCelebrate: boolean; celebrationType: string } {
  const [shouldCelebrate, setShouldCelebrate] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (condition && !hasTriggered.current) {
      hasTriggered.current = true;
      setShouldCelebrate(true);

      const timeout = setTimeout(() => {
        setShouldCelebrate(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [condition]);

  return { shouldCelebrate, celebrationType: type };
}

/**
 * Progress bar animation value
 */
export function useProgressAnimation(
  progress: number,
  options?: { duration?: number }
): MotionValue<number> {
  const prefersReducedMotion = useReducedMotion();
  const motionValue = useSpring(prefersReducedMotion ? progress : 0, {
    stiffness: 50,
    damping: 20,
  });

  useEffect(() => {
    motionValue.set(progress);
  }, [progress, motionValue]);

  return motionValue;
}

/**
 * Shimmer loading effect
 */
export function useShimmerEffect(
  isLoading: boolean
): { shimmerStyle: React.CSSProperties } {
  const prefersReducedMotion = useReducedMotion();

  const shimmerStyle: React.CSSProperties = isLoading && !prefersReducedMotion
    ? {
        background: `linear-gradient(
          90deg,
          transparent 0%,
          hsla(var(--foreground) / 0.05) 50%,
          transparent 100%
        )`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }
    : {};

  return { shimmerStyle };
}

/**
 * Pulse animation for attention
 */
export function usePulseAttention(
  shouldPulse: boolean
): { pulseScale: MotionValue<number> } {
  const prefersReducedMotion = useReducedMotion();
  const pulseScale = useMotionValue(1);

  useEffect(() => {
    if (!shouldPulse || prefersReducedMotion) {
      pulseScale.set(1);
      return;
    }

    let frame: number;
    let startTime: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const scale = 1 + Math.sin(elapsed / 500) * 0.03;
      pulseScale.set(scale);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [shouldPulse, pulseScale, prefersReducedMotion]);

  return { pulseScale };
}

/**
 * Smooth scroll reveal intersection observer
 */
export function useScrollReveal(
  ref: React.RefObject<HTMLElement>,
  options?: { threshold?: number; rootMargin?: string }
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: options?.threshold || 0.1,
        rootMargin: options?.rootMargin || '0px',
      }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options?.threshold, options?.rootMargin]);

  return isVisible;
}
