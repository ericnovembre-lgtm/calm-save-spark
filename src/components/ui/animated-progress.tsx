import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  gradient?: boolean;
  animated?: boolean;
}

/**
 * AnimatedProgress - Enhanced progress bar with gradient fills and smooth animations
 * Respects reduced motion preferences
 */
export function AnimatedProgress({
  value,
  max = 100,
  className,
  showLabel = false,
  gradient = true,
  animated = true,
}: AnimatedProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  // Animate value changes
  useEffect(() => {
    if (prefersReducedMotion || !animated) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const steps = 60;
    const stepValue = (value - displayValue) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(prev => prev + stepValue);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, displayValue, prefersReducedMotion, animated]);

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary/30 backdrop-blur-sm">
        <motion.div
          className={cn(
            'h-full rounded-full',
            gradient
              ? 'bg-gradient-to-r from-primary via-primary/90 to-accent'
              : 'bg-primary'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* Shimmer effect */}
          {!prefersReducedMotion && animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}
        </motion.div>

        {/* Glow effect */}
        {!prefersReducedMotion && percentage > 0 && (
          <motion.div
            className="absolute right-0 top-0 h-full w-8 bg-primary/50 blur-xl"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-muted-foreground">
            {displayValue.toFixed(0)} / {max}
          </span>
          <span className="font-semibold text-foreground tabular-nums">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}
