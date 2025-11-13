import { useReducedMotion } from './useReducedMotion';
import { useHapticFeedback } from './useHapticFeedback';
import { PanInfo } from 'framer-motion';

/**
 * Hook for gesture-based interactions
 * Provides handlers for swipe, pinch, and long-press gestures
 */
export function useGestures() {
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();

  /**
   * Swipe gesture handler
   * Triggers callback when swipe threshold is exceeded
   */
  const handleSwipe = (
    info: PanInfo,
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    threshold: number = 100
  ) => {
    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) * velocity.x;

    if (swipe < -threshold && onSwipeLeft) {
      triggerHaptic('medium');
      onSwipeLeft();
    } else if (swipe > threshold && onSwipeRight) {
      triggerHaptic('medium');
      onSwipeRight();
    }
  };

  /**
   * Long press gesture handler
   * Triggers callback after holding for specified duration
   */
  const handleLongPress = (
    callback: () => void,
    duration: number = 500
  ) => {
    let timeout: NodeJS.Timeout;

    const onPressStart = () => {
      timeout = setTimeout(() => {
        triggerHaptic('heavy');
        callback();
      }, duration);
    };

    const onPressEnd = () => {
      clearTimeout(timeout);
    };

    return {
      onPointerDown: onPressStart,
      onPointerUp: onPressEnd,
      onPointerLeave: onPressEnd,
    };
  };

  /**
   * Pinch-to-zoom gesture constraints
   * Returns scale limits and snap points
   */
  const getPinchConstraints = () => {
    return {
      scale: {
        min: 0.5,
        max: 3,
      },
      snapPoints: [1, 1.5, 2],
    };
  };

  /**
   * Drag constraints for swipeable elements
   */
  const getSwipeConstraints = (axis: 'x' | 'y' = 'x') => {
    return {
      drag: axis,
      dragElastic: 0.2,
      dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
    };
  };

  return {
    handleSwipe,
    handleLongPress,
    getPinchConstraints,
    getSwipeConstraints,
    prefersReducedMotion,
  };
}
