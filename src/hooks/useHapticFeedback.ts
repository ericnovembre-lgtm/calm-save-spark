import { useReducedMotion } from './useReducedMotion';
import { haptics } from '@/lib/haptics';

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
 * 
 * @deprecated Use haptics utility from @/lib/haptics for better control
 */
export function useHapticFeedback() {
  const prefersReducedMotion = useReducedMotion();

  const triggerHaptic = (pattern: HapticPattern = 'light') => {
    // Don't trigger haptics if user prefers reduced motion
    if (prefersReducedMotion) {
      return;
    }

    // Use centralized haptics manager
    switch (pattern) {
      case 'light':
        haptics.vibrate('light');
        break;
      case 'medium':
        haptics.vibrate('medium');
        break;
      case 'heavy':
        haptics.vibrate('heavy');
        break;
      case 'success':
        haptics.pattern('success');
        break;
    }
  };

  return { triggerHaptic };
}
