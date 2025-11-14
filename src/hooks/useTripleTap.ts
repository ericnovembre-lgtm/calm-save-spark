import { useRef, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface UseTripleTapOptions {
  onTripleTap: () => void;
  timeWindow?: number; // ms between taps
  cooldown?: number; // ms before can trigger again
}

/**
 * Hook to detect triple-tap gestures on an element
 * Respects reduced motion preferences
 */
export function useTripleTap({ 
  onTripleTap, 
  timeWindow = 500,
  cooldown = 3000 
}: UseTripleTapOptions) {
  const prefersReducedMotion = useReducedMotion();
  const tapTimestamps = useRef<number[]>([]);
  const lastTriggered = useRef<number>(0);

  const handleTap = useCallback(() => {
    if (prefersReducedMotion) return;

    const now = Date.now();
    
    // Check cooldown
    if (now - lastTriggered.current < cooldown) return;

    // Add current tap
    tapTimestamps.current.push(now);
    
    // Keep only recent taps within time window
    tapTimestamps.current = tapTimestamps.current.filter(
      timestamp => now - timestamp < timeWindow
    );

    // Check if we have 3 taps
    if (tapTimestamps.current.length >= 3) {
      onTripleTap();
      lastTriggered.current = now;
      tapTimestamps.current = [];
    }
  }, [onTripleTap, timeWindow, cooldown, prefersReducedMotion]);

  const register = {
    onClick: handleTap,
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      handleTap();
    }
  };

  return { register };
}

