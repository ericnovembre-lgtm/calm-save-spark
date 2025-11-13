import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Button, ButtonProps } from '@/components/ui/button';
import { forwardRef } from 'react';

interface AnimatedButtonProps extends ButtonProps {
  hapticFeedback?: boolean;
  pulseOnHover?: boolean;
}

/**
 * AnimatedButton - Enhanced button with micro-interactions
 * Provides haptic feedback, hover effects, and respects reduced motion
 */
export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(({
  children,
  onClick,
  hapticFeedback = true,
  pulseOnHover = false,
  disabled,
  className,
  ...props
}, ref) => {
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && hapticFeedback) {
      triggerHaptic('medium');
    }
    onClick?.(e);
  };

  if (prefersReducedMotion || disabled) {
    return (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
      }}
      whileTap={{ 
        scale: 0.95,
      }}
      animate={pulseOnHover ? {
        scale: [1, 1.02, 1],
      } : {}}
      transition={{
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1],
        ...(pulseOnHover && {
          repeat: Infinity,
          repeatDelay: 1,
        }),
      }}
      style={{ display: 'inline-block' }}
    >
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
});

AnimatedButton.displayName = 'AnimatedButton';
