import { useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MorphingNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  delay?: number;
  separator?: string;
}

/**
 * Animated number counter with morphing effect
 * Counts up to target value with smooth easing and overshoot
 */
export const MorphingNumber = ({
  value,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  delay = 0,
  separator = ',',
}: MorphingNumberProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [hasAnimated, setHasAnimated] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      setHasAnimated(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setTimeout(() => setHasAnimated(true), delay * 1000);
        }
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [prefersReducedMotion, delay, hasAnimated]);

  if (prefersReducedMotion) {
    return (
      <span className={className}>
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </span>
    );
  }

  return (
    <motion.div
      ref={elementRef}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {hasAnimated ? (
        <CountUp
          start={0}
          end={value}
          duration={duration}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          separator={separator}
          useEasing={true}
          easingFn={(t, b, c, d) => {
            // Custom easing with overshoot for excitement
            t /= d;
            const overshoot = 1.1;
            if (t < 0.5) {
              return c * Math.pow(2 * t, 2) / 2 + b;
            }
            return c * (1 - Math.pow(-2 * (t - 1) + 2, 2) / 2) + b;
          }}
        />
      ) : (
        <span>
          {prefix}0{suffix}
        </span>
      )}
    </motion.div>
  );
};

// Add missing import
import { useState } from 'react';
