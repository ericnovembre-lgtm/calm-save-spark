import { useReducedMotion } from './useReducedMotion';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10], // Short, pause, short for success feedback
};

/**
 * Hook for triggering haptic feedback on mobile devices
 * Respects reduced motion preferences and gracefully degrades on unsupported devices
 */
export function useHapticFeedback() {
  const prefersReducedMotion = useReducedMotion();

  const triggerHaptic = (pattern: HapticPattern = 'light') => {
    // Don't trigger haptics if user prefers reduced motion
    if (prefersReducedMotion) {
      return;
    }

    // Check if Vibration API is supported
    if (!navigator.vibrate) {
      return;
    }

    try {
      const vibrationPattern = HAPTIC_PATTERNS[pattern];
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      // Silently fail if vibration is not supported or blocked
      console.debug('Haptic feedback not available:', error);
    }
  };

  return { triggerHaptic };
}
