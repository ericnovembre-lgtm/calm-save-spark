import { motion, HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InteractiveCardProps extends Omit<HTMLMotionProps<'div'>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  hapticOnHover?: boolean;
  hapticOnPress?: boolean;
  scaleOnHover?: number;
  scaleOnPress?: number;
}

/**
 * InteractiveCard - Enhanced card with micro-interactions
 * Provides smooth hover/press animations, haptic feedback, and respects reduced motion
 */
export const InteractiveCard = forwardRef<HTMLDivElement, InteractiveCardProps>(({
  children,
  className,
  hapticOnHover = false,
  hapticOnPress = true,
  scaleOnHover = 1.02,
  scaleOnPress = 0.98,
  onClick,
  ...props
}, ref) => {
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();

  const handleHoverStart = () => {
    if (hapticOnHover) {
      triggerHaptic('light');
    }
  };

  const handleTapStart = () => {
    if (hapticOnPress) {
      triggerHaptic('light');
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hapticOnPress) {
      triggerHaptic('medium');
    }
    onClick?.(e);
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        'bg-glass border border-glass-border rounded-2xl',
        'backdrop-blur-glass shadow-glass',
        'transition-all duration-300',
        'cursor-pointer',
        className
      )}
      initial={false}
      whileHover={prefersReducedMotion ? {} : { 
        scale: scaleOnHover,
        y: -4,
        borderColor: 'var(--glass-border-hover)',
        backgroundColor: 'var(--glass-bg-hover)',
        boxShadow: 'var(--glass-shadow-elevated)'
      }}
      whileTap={prefersReducedMotion ? {} : { 
        scale: scaleOnPress 
      }}
      onHoverStart={handleHoverStart}
      onTapStart={handleTapStart}
      onClick={handleClick}
      transition={{
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

InteractiveCard.displayName = 'InteractiveCard';
