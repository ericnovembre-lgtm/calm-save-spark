import { useRef, useCallback } from 'react';
import { haptics } from '@/lib/haptics';
import { useReducedMotion } from './useReducedMotion';

interface UseDoubleTapOptions {
  /** Maximum interval between taps in ms (default: 300) */
  interval?: number;
  /** Enable haptic feedback (default: true) */
  enableHaptics?: boolean;
  /** Optional single tap callback */
  onSingleTap?: () => void;
}

/**
 * Hook for detecting double-tap gestures
 * Useful for quick-zoom on charts and toggling detail views
 */
export function useDoubleTap(
  onDoubleTap: () => void,
  options: UseDoubleTapOptions = {}
) {
  const {
    interval = 300,
    enableHaptics = true,
    onSingleTap,
  } = options;

  const prefersReducedMotion = useReducedMotion();
  const lastTapRef = useRef<number>(0);
  const singleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      // Clear any pending single tap timeout
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }

      if (timeSinceLastTap < interval && timeSinceLastTap > 0) {
        // Double tap detected
        event.preventDefault();
        
        if (enableHaptics && !prefersReducedMotion) {
          haptics.vibrate('medium');
        }
        
        onDoubleTap();
        lastTapRef.current = 0; // Reset to prevent triple-tap
      } else {
        // First tap - wait for potential second tap
        lastTapRef.current = now;
        
        if (onSingleTap) {
          singleTapTimeoutRef.current = setTimeout(() => {
            if (enableHaptics && !prefersReducedMotion) {
              haptics.vibrate('light');
            }
            onSingleTap();
            singleTapTimeoutRef.current = null;
          }, interval);
        }
      }
    },
    [interval, enableHaptics, onDoubleTap, onSingleTap, prefersReducedMotion]
  );

  return {
    onClick: handleTap,
    onTouchEnd: (e: React.TouchEvent) => {
      // Only handle single touch
      if (e.changedTouches.length === 1) {
        handleTap(e);
      }
    },
  };
}
