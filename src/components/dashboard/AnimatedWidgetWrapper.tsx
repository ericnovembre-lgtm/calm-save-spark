import { useRef, useEffect, ReactNode } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { 
  widgetContainerVariants, 
  reducedMotionVariants,
  valueUpdateFlash,
  valueIncreaseFlash,
  valueDecreaseFlash,
  pulseVariants,
  glowVariants,
} from '@/lib/widget-animation-variants';

interface AnimatedWidgetWrapperProps {
  children: ReactNode;
  widgetId: string;
  /** Value to track for change animations */
  trackedValue?: number | string;
  /** Type of animation on value change */
  changeAnimation?: 'flash' | 'pulse' | 'glow' | 'none';
  /** Direction indicator for value changes */
  changeDirection?: 'increase' | 'decrease' | 'neutral';
  className?: string;
  /** Delay for stagger entrance animation */
  enterDelay?: number;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function AnimatedWidgetWrapper({
  children,
  widgetId,
  trackedValue,
  changeAnimation = 'flash',
  changeDirection = 'neutral',
  className = '',
  enterDelay = 0,
}: AnimatedWidgetWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimation();
  const previousValue = usePrevious(trackedValue);

  // Detect value changes and trigger animation
  useEffect(() => {
    if (prefersReducedMotion || changeAnimation === 'none') return;
    if (trackedValue === undefined || previousValue === undefined) return;
    if (trackedValue === previousValue) return;

    const triggerAnimation = async () => {
      switch (changeAnimation) {
        case 'flash':
          if (changeDirection === 'increase') {
            await controls.start(valueIncreaseFlash);
          } else if (changeDirection === 'decrease') {
            await controls.start(valueDecreaseFlash);
          } else {
            await controls.start(valueUpdateFlash);
          }
          break;
        case 'pulse':
          await controls.start('pulse');
          break;
        case 'glow':
          await controls.start('glow');
          break;
      }
    };

    triggerAnimation();
  }, [trackedValue, previousValue, changeAnimation, changeDirection, controls, prefersReducedMotion]);

  const variants = prefersReducedMotion ? reducedMotionVariants : widgetContainerVariants;
  const animationVariants = changeAnimation === 'pulse' ? pulseVariants : 
                           changeAnimation === 'glow' ? glowVariants : undefined;

  return (
    <motion.div
      key={widgetId}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay: enterDelay }}
      className={className}
    >
      <motion.div
        animate={controls}
        variants={animationVariants}
        className="h-full rounded-xl overflow-hidden"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Animated number counter component
interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 0.5,
  className = '',
}: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion();
  const previousValue = usePrevious(value);
  const controls = useAnimation();
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion || previousValue === undefined) {
      if (displayRef.current) {
        displayRef.current.textContent = `${prefix}${value.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${suffix}`;
      }
      return;
    }

    const startValue = previousValue;
    const endValue = value;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * eased;
      
      if (displayRef.current) {
        displayRef.current.textContent = `${prefix}${currentValue.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, previousValue, prefix, suffix, decimals, duration, prefersReducedMotion]);

  const formattedValue = `${prefix}${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;

  return (
    <span ref={displayRef} className={className}>
      {formattedValue}
    </span>
  );
}

// Progress bar with animation
interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}

export function AnimatedProgressBar({
  value,
  max = 100,
  className = '',
  barClassName = '',
}: AnimatedProgressBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full bg-muted rounded-full overflow-hidden ${className}`}>
      <motion.div
        className={`h-full bg-primary rounded-full ${barClassName}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={
          prefersReducedMotion 
            ? { duration: 0 } 
            : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
        }
      />
    </div>
  );
}
