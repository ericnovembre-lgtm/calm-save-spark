import { useEffect, useState, useCallback, useRef } from "react";
import { motion, PanInfo } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { haptics } from "@/lib/haptics";
import { saveplus_audit_event } from "@/lib/analytics";
import NeutralConfetti from "@/components/effects/NeutralConfetti";

interface GestureHandlerProps {
  children: React.ReactNode;
  onShake?: () => void;
  enableShakeToConfetti?: boolean;
}

/**
 * GestureHandler - Mobile gesture detection and handling
 * Features:
 * - Shake detection for confetti
 * - Enhanced swipe gestures
 * - Haptic feedback integration
 */
export const GestureHandler = ({ 
  children, 
  onShake,
  enableShakeToConfetti = true 
}: GestureHandlerProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  // Shake detection state
  const lastShakeTime = useRef<number>(0);
  const shakeThreshold = 15; // Acceleration threshold
  const shakeTimeout = 1000; // Minimum time between shakes
  
  /**
   * Detect device shake using accelerometer
   */
  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    if (prefersReducedMotion) return;
    
    const { accelerationIncludingGravity } = event;
    if (!accelerationIncludingGravity) return;
    
    const { x, y, z } = accelerationIncludingGravity;
    if (x === null || y === null || z === null) return;
    
    // Calculate total acceleration
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    
    // Check if shake is strong enough and enough time has passed
    const now = Date.now();
    if (
      acceleration > shakeThreshold && 
      now - lastShakeTime.current > shakeTimeout
    ) {
      lastShakeTime.current = now;
      handleShake();
    }
  }, [prefersReducedMotion]);
  
  /**
   * Handle shake gesture
   */
  const handleShake = useCallback(() => {
    // Trigger haptic feedback
    haptics.achievementUnlocked();
    
    // Track analytics
    saveplus_audit_event('shake_gesture_triggered', {
      timestamp: Date.now(),
      feature: 'welcome_page'
    });
    
    // Show confetti if enabled
    if (enableShakeToConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    
    // Call custom handler if provided
    if (onShake) {
      onShake();
    }
  }, [enableShakeToConfetti, onShake]);
  
  /**
   * Request permission and set up motion listener (iOS 13+)
   */
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const setupMotionListener = async () => {
      // Check if DeviceMotionEvent is available
      if (typeof DeviceMotionEvent === 'undefined') {
        return;
      }
      
      // iOS 13+ requires permission
      if (
        typeof (DeviceMotionEvent as any).requestPermission === 'function'
      ) {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
          }
        } catch (error) {
          console.debug('Device motion permission denied:', error);
        }
      } else {
        // Non-iOS devices or older iOS
        window.addEventListener('devicemotion', handleDeviceMotion);
      }
    };
    
    setupMotionListener();
    
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [handleDeviceMotion, prefersReducedMotion]);
  
  return (
    <>
      {children}
      
      {/* Shake-triggered confetti */}
      {enableShakeToConfetti && <NeutralConfetti show={showConfetti} />}
    </>
  );
};

/**
 * PinchZoomWrapper - Wrapper for pinch-to-zoom functionality
 */
interface PinchZoomWrapperProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  onZoomChange?: (scale: number) => void;
}

export const PinchZoomWrapper = ({
  children,
  minScale = 1,
  maxScale = 3,
  onZoomChange,
}: PinchZoomWrapperProps) => {
  const [scale, setScale] = useState(1);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);
  const prefersReducedMotion = useReducedMotion();
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Calculate distance between two touch points
  const getDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        setInitialDistance(getDistance(e.touches));
        setInitialScale(scale);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance !== null) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches);
        const scaleChange = currentDistance / initialDistance;
        const newScale = Math.max(
          minScale,
          Math.min(maxScale, initialScale * scaleChange)
        );
        
        setScale(newScale);
        
        // Haptic feedback at zoom boundaries
        if (newScale === minScale || newScale === maxScale) {
          haptics.rangeLimit();
        }
        
        if (onZoomChange) {
          onZoomChange(newScale);
        }
      }
    };
    
    const handleTouchEnd = () => {
      setInitialDistance(null);
    };
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale, initialDistance, minScale, maxScale, onZoomChange, prefersReducedMotion, initialScale]);
  
  if (prefersReducedMotion) {
    return <div ref={elementRef}>{children}</div>;
  }
  
  return (
    <motion.div
      ref={elementRef}
      style={{
        scale,
        transformOrigin: 'center center',
      }}
      className="touch-pan-y"
      animate={{ scale }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * SwipeableCard - Card component with swipe gestures
 */
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  className = "",
}: SwipeableCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  const handleDragEnd = useCallback((
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);
    
    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) * velocity.x;
    
    if (swipe < -threshold && onSwipeLeft) {
      haptics.swipe();
      saveplus_audit_event('swipe_gesture', { direction: 'left' });
      onSwipeLeft();
    } else if (swipe > threshold && onSwipeRight) {
      haptics.swipe();
      saveplus_audit_event('swipe_gesture', { direction: 'right' });
      onSwipeRight();
    }
  }, [threshold, onSwipeLeft, onSwipeRight]);
  
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <motion.div
      className={className}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={() => {
        setIsDragging(true);
        haptics.dragStart();
      }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 0.98 }}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Hook for requesting device motion permission (iOS)
 */
export const useDeviceMotionPermission = () => {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const requestPermission = async () => {
    if (typeof DeviceMotionEvent === 'undefined') {
      setPermission('denied');
      return;
    }
    
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const result = await (DeviceMotionEvent as any).requestPermission();
        setPermission(result);
        return result;
      } catch (error) {
        console.error('Error requesting device motion permission:', error);
        setPermission('denied');
        return 'denied';
      }
    } else {
      // Permission not required on this device
      setPermission('granted');
      return 'granted';
    }
  };
  
  return { permission, requestPermission };
};
