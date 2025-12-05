import { ReactNode, useCallback, useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Archive, ArrowRight, X } from 'lucide-react';
import { haptics } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface SwipeableWidgetProps {
  children: ReactNode;
  /** Callback when swiped left (archive/dismiss) */
  onSwipeLeft?: () => void;
  /** Callback when swiped right (quick action) */
  onSwipeRight?: () => void;
  /** Swipe threshold in pixels (default: 100) */
  threshold?: number;
  /** Left action label */
  leftLabel?: string;
  /** Right action label */
  rightLabel?: string;
  /** Disable swipe gestures */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Wrapper component that adds swipe-to-action gestures to any widget
 * Swipe left to archive/dismiss, swipe right for quick action
 */
export function SwipeableWidget({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  leftLabel = 'Dismiss',
  rightLabel = 'Quick Action',
  disabled = false,
  className,
}: SwipeableWidgetProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  
  const x = useMotionValue(0);
  
  // Transform for action hints
  const leftOpacity = useTransform(x, [-threshold, -threshold / 2, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, threshold / 2, threshold], [0, 0.5, 1]);
  const leftScale = useTransform(x, [-threshold, -threshold / 2, 0], [1, 0.8, 0.5]);
  const rightScale = useTransform(x, [0, threshold / 2, threshold], [0.5, 0.8, 1]);
  
  // Background color based on direction
  const backgroundColor = useTransform(
    x,
    [-threshold, 0, threshold],
    [
      'hsl(var(--destructive) / 0.2)',
      'transparent',
      'hsl(var(--primary) / 0.2)',
    ]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    if (!prefersReducedMotion) {
      haptics.vibrate('light');
    }
  }, [prefersReducedMotion]);

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Haptic feedback at threshold
      if (!prefersReducedMotion) {
        if (Math.abs(info.offset.x) >= threshold && Math.abs(info.offset.x) < threshold + 10) {
          haptics.vibrate('medium');
        }
      }
    },
    [threshold, prefersReducedMotion]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      
      const offsetX = info.offset.x;
      const velocityX = info.velocity.x;
      
      // Swipe detection with velocity boost
      const swipeThreshold = threshold * 0.7;
      const isSwipe = Math.abs(offsetX) > swipeThreshold || Math.abs(velocityX) > 500;
      
      if (isSwipe) {
        if (offsetX < -swipeThreshold && onSwipeLeft) {
          if (!prefersReducedMotion) {
            haptics.swipe();
          }
          soundEffects.swipe();
          onSwipeLeft();
        } else if (offsetX > swipeThreshold && onSwipeRight) {
          if (!prefersReducedMotion) {
            haptics.swipe();
          }
          soundEffects.swipe();
          onSwipeRight();
        }
      }
    },
    [threshold, onSwipeLeft, onSwipeRight, prefersReducedMotion]
  );

  if (disabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      {/* Background action hints */}
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none"
        style={{ backgroundColor }}
      >
        {/* Left action (dismiss) */}
        {onSwipeLeft && (
          <motion.div
            className="flex items-center gap-2 text-destructive"
            style={{ opacity: leftOpacity, scale: leftScale }}
          >
            <Archive className="w-5 h-5" />
            <span className="text-sm font-medium">{leftLabel}</span>
          </motion.div>
        )}
        
        {/* Right action */}
        {onSwipeRight && (
          <motion.div
            className="flex items-center gap-2 text-primary ml-auto"
            style={{ opacity: rightOpacity, scale: rightScale }}
          >
            <span className="text-sm font-medium">{rightLabel}</span>
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        )}
      </motion.div>

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          'relative z-10 touch-pan-y',
          isDragging && 'cursor-grabbing'
        )}
        whileTap={{ cursor: 'grabbing' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
