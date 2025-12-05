import { useCallback } from 'react';
import { haptics, HapticPattern } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';
import { useReducedMotion } from './useReducedMotion';

interface FeedbackOptions {
  /** Enable haptic feedback (default: true) */
  haptic?: boolean;
  /** Enable sound feedback (default: true) */
  sound?: boolean;
}

/**
 * Unified hook combining haptics + sounds for consistent interaction feedback
 * Use for any UI interaction that needs multi-sensory feedback
 */
export function useInteractionFeedback() {
  const prefersReducedMotion = useReducedMotion();

  const triggerFeedback = useCallback(
    (hapticPattern: HapticPattern, soundFn?: () => void, options: FeedbackOptions = {}) => {
      const { haptic = true, sound = true } = options;

      if (haptic && !prefersReducedMotion) {
        haptics.pattern(hapticPattern);
      }

      if (sound && soundFn) {
        soundFn();
      }
    },
    [prefersReducedMotion]
  );

  /** Success feedback - transaction completed, goal reached, etc. */
  const onSuccess = useCallback(
    (options?: FeedbackOptions) => {
      triggerFeedback('success', () => soundEffects.success(), options);
    },
    [triggerFeedback]
  );

  /** Error feedback - validation error, failed action */
  const onError = useCallback(
    (options?: FeedbackOptions) => {
      triggerFeedback('error', () => soundEffects.error(), options);
    },
    [triggerFeedback]
  );

  /** Warning feedback - budget exceeded, unusual activity */
  const onWarning = useCallback(
    (options?: FeedbackOptions) => {
      triggerFeedback('warning', () => soundEffects.warning(), options);
    },
    [triggerFeedback]
  );

  /** Achievement feedback - milestone, badge unlocked */
  const onAchievement = useCallback(
    (options?: FeedbackOptions) => {
      triggerFeedback('achievement', () => soundEffects.milestone(), options);
    },
    [triggerFeedback]
  );

  /** Notification feedback - new AI insight, message received */
  const onNotification = useCallback(
    (options?: FeedbackOptions) => {
      triggerFeedback('notification', () => soundEffects.coinDrop(), options);
    },
    [triggerFeedback]
  );

  /** Subtle tap feedback - button press, selection change */
  const onTap = useCallback(
    (options?: FeedbackOptions) => {
      triggerFeedback('tap', () => soundEffects.click(), options);
    },
    [triggerFeedback]
  );

  /** Insight feedback - AI suggestion arrival (subtle) */
  const onInsight = useCallback(
    (options?: FeedbackOptions) => {
      if (!prefersReducedMotion && options?.haptic !== false) {
        haptics.vibrate('light');
      }
      if (options?.sound !== false) {
        soundEffects.progressTick();
      }
    },
    [prefersReducedMotion]
  );

  /** Swipe feedback - gesture recognized */
  const onSwipe = useCallback(
    (options?: FeedbackOptions) => {
      if (!prefersReducedMotion && options?.haptic !== false) {
        haptics.swipe();
      }
      if (options?.sound !== false) {
        soundEffects.swipe();
      }
    },
    [prefersReducedMotion]
  );

  /** Transaction feedback - money moved */
  const onTransaction = useCallback(
    (type: 'deposit' | 'withdraw' | 'transfer', options?: FeedbackOptions) => {
      if (!prefersReducedMotion && options?.haptic !== false) {
        haptics.pattern(type === 'deposit' ? 'success' : 'notification');
      }
      if (options?.sound !== false) {
        soundEffects.coinDrop();
      }
    },
    [prefersReducedMotion]
  );

  /** Goal progress feedback - step towards goal */
  const onGoalProgress = useCallback(
    (options?: FeedbackOptions) => {
      if (!prefersReducedMotion && options?.haptic !== false) {
        haptics.vibrate('medium');
      }
      if (options?.sound !== false) {
        soundEffects.progressTick();
      }
    },
    [prefersReducedMotion]
  );

  return {
    onSuccess,
    onError,
    onWarning,
    onAchievement,
    onNotification,
    onTap,
    onInsight,
    onSwipe,
    onTransaction,
    onGoalProgress,
    // Direct access for custom patterns
    triggerHaptic: (pattern: HapticPattern) => {
      if (!prefersReducedMotion) {
        haptics.pattern(pattern);
      }
    },
  };
}
