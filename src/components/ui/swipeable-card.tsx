import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Trash2, Archive } from 'lucide-react';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon?: ReactNode;
    label?: string;
    color?: string;
  };
  rightAction?: {
    icon?: ReactNode;
    label?: string;
    color?: string;
  };
  className?: string;
  disabled?: boolean;
}

/**
 * SwipeableCard - Card with swipe-to-reveal actions
 * Swipe left or right to reveal and trigger actions
 */
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = { icon: <Archive className="w-5 h-5" />, label: 'Archive', color: 'bg-blue-500' },
  rightAction = { icon: <Trash2 className="w-5 h-5" />, label: 'Delete', color: 'bg-red-500' },
  className = '',
  disabled = false,
}: SwipeableCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();
  const [isDragging, setIsDragging] = useState(false);
  
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;

    if (info.offset.x < -threshold && onSwipeLeft) {
      triggerHaptic('medium');
      onSwipeLeft();
    } else if (info.offset.x > threshold && onSwipeRight) {
      triggerHaptic('medium');
      onSwipeRight();
    }
  };

  if (disabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className="relative overflow-hidden">
      {/* Left action (revealed on right swipe) */}
      {onSwipeRight && (
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 flex items-center justify-start px-6',
            rightAction.color
          )}
          style={{
            width: useTransform(x, [0, 150], [0, 150]),
            opacity: useTransform(x, [0, 75, 150], [0, 0.5, 1]),
          }}
        >
          <div className="flex items-center gap-2 text-white">
            {rightAction.icon}
            <span className="font-medium">{rightAction.label}</span>
          </div>
        </motion.div>
      )}

      {/* Right action (revealed on left swipe) */}
      {onSwipeLeft && (
        <motion.div
          className={cn(
            'absolute inset-y-0 right-0 flex items-center justify-end px-6',
            leftAction.color
          )}
          style={{
            width: useTransform(x, [-150, 0], [150, 0]),
            opacity: useTransform(x, [-150, -75, 0], [1, 0.5, 0]),
          }}
        >
          <div className="flex items-center gap-2 text-white">
            <span className="font-medium">{leftAction.label}</span>
            {leftAction.icon}
          </div>
        </motion.div>
      )}

      {/* Swipeable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x, opacity, scale }}
        className={cn(
          'relative cursor-grab active:cursor-grabbing',
          isDragging && 'z-10',
          className
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}
