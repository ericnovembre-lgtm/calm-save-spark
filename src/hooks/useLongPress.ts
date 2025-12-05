import { useRef, useCallback } from 'react';
import { haptics } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';
import { useReducedMotion } from './useReducedMotion';

interface UseLongPressOptions {
  /** Duration in ms before triggering (default: 500) */
  duration?: number;
  /** Cancel if user moves finger (default: true) */
  cancelOnMove?: boolean;
  /** Movement threshold in pixels (default: 10) */
  moveThreshold?: number;
  /** Enable haptic feedback (default: true) */
  enableHaptics?: boolean;
  /** Enable sound feedback (default: false) */
  enableSound?: boolean;
  /** Callback on press start */
  onStart?: () => void;
  /** Callback on press end (before duration) */
  onCancel?: () => void;
}

/**
 * Hook for detecting long-press gestures with haptic feedback
 * Returns event handlers to spread on any element
 */
export function useLongPress(
  callback: () => void,
  options: UseLongPressOptions = {}
) {
  const {
    duration = 500,
    cancelOnMove = true,
    moveThreshold = 10,
    enableHaptics = true,
    enableSound = false,
    onStart,
    onCancel,
  } = options;

  const prefersReducedMotion = useReducedMotion();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressRef = useRef(false);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    startPositionRef.current = null;
    isLongPressRef.current = false;
  }, []);

  const start = useCallback(
    (event: React.PointerEvent | React.TouchEvent) => {
      // Get starting position
      const clientX = 'touches' in event 
        ? event.touches[0].clientX 
        : event.clientX;
      const clientY = 'touches' in event 
        ? event.touches[0].clientY 
        : event.clientY;
      
      startPositionRef.current = { x: clientX, y: clientY };
      isLongPressRef.current = false;

      onStart?.();

      // Light haptic on press start
      if (enableHaptics && !prefersReducedMotion) {
        haptics.vibrate('light');
      }

      timeoutRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        
        // Heavy haptic on long press trigger
        if (enableHaptics && !prefersReducedMotion) {
          haptics.longPress();
        }
        
        if (enableSound) {
          soundEffects.click();
        }
        
        callback();
      }, duration);
    },
    [callback, duration, enableHaptics, enableSound, onStart, prefersReducedMotion]
  );

  const move = useCallback(
    (event: React.PointerEvent | React.TouchEvent) => {
      if (!cancelOnMove || !startPositionRef.current || !timeoutRef.current) {
        return;
      }

      const clientX = 'touches' in event 
        ? event.touches[0].clientX 
        : event.clientX;
      const clientY = 'touches' in event 
        ? event.touches[0].clientY 
        : event.clientY;

      const deltaX = Math.abs(clientX - startPositionRef.current.x);
      const deltaY = Math.abs(clientY - startPositionRef.current.y);

      // Cancel if moved beyond threshold
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        onCancel?.();
        clear();
      }
    },
    [cancelOnMove, moveThreshold, onCancel, clear]
  );

  const end = useCallback(() => {
    if (timeoutRef.current && !isLongPressRef.current) {
      onCancel?.();
    }
    clear();
  }, [clear, onCancel]);

  return {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: end,
    onPointerLeave: end,
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: end,
    onTouchCancel: end,
    // Prevent context menu on long press
    onContextMenu: (e: React.MouseEvent) => {
      if (isLongPressRef.current) {
        e.preventDefault();
      }
    },
  };
}
