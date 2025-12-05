import { useCallback } from 'react';
import { useInteractionFeedback } from './useInteractionFeedback';
import { haptics } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';
import { notificationSounds } from '@/lib/notification-sounds';
import { useReducedMotion } from './useReducedMotion';

interface TransactionFeedbackOptions {
  amount?: number;
  isLargeTransaction?: boolean;
}

/**
 * Hook for transaction-specific haptic and sound feedback
 * Provides specialized feedback patterns for different transaction types
 */
export function useTransactionFeedback() {
  const prefersReducedMotion = useReducedMotion();
  const { onError, onWarning } = useInteractionFeedback();

  const LARGE_TRANSACTION_THRESHOLD = 500;

  const onDeposit = useCallback((options?: TransactionFeedbackOptions) => {
    const isLarge = options?.isLargeTransaction || 
      (options?.amount && options.amount >= LARGE_TRANSACTION_THRESHOLD);
    
    if (!prefersReducedMotion) {
      haptics.formSuccess();
    }
    soundEffects.coinDrop();
    
    // Extra celebration for large deposits
    if (isLarge) {
      setTimeout(() => {
        notificationSounds.celebrate();
      }, 300);
    }
  }, [prefersReducedMotion]);

  const onWithdraw = useCallback((options?: TransactionFeedbackOptions) => {
    const isLarge = options?.isLargeTransaction || 
      (options?.amount && options.amount >= LARGE_TRANSACTION_THRESHOLD);
    
    if (!prefersReducedMotion) {
      haptics.vibrate(isLarge ? 'medium' : 'light');
    }
    soundEffects.swipe();
  }, [prefersReducedMotion]);

  const onTransfer = useCallback(() => {
    if (!prefersReducedMotion) {
      haptics.swipe();
    }
    soundEffects.swipe();
    
    // Confirm sound after brief delay
    setTimeout(() => {
      soundEffects.success();
    }, 200);
  }, [prefersReducedMotion]);

  const onPayment = useCallback((options?: TransactionFeedbackOptions) => {
    const isLarge = options?.isLargeTransaction || 
      (options?.amount && options.amount >= LARGE_TRANSACTION_THRESHOLD);
    
    if (!prefersReducedMotion) {
      haptics.formSuccess();
    }
    soundEffects.success();
    
    // Warning feedback for large payments
    if (isLarge && !prefersReducedMotion) {
      setTimeout(() => {
        haptics.vibrate('light');
      }, 100);
    }
  }, [prefersReducedMotion]);

  const onGoalContribution = useCallback(() => {
    if (!prefersReducedMotion) {
      haptics.formSuccess();
    }
    soundEffects.coinDrop();
    notificationSounds.celebrate();
  }, [prefersReducedMotion]);

  const onDebtPayment = useCallback((options?: TransactionFeedbackOptions) => {
    if (!prefersReducedMotion) {
      haptics.formSuccess();
    }
    soundEffects.success();
    
    // Extra celebration for large debt payments
    const isLarge = options?.isLargeTransaction || 
      (options?.amount && options.amount >= LARGE_TRANSACTION_THRESHOLD);
    if (isLarge) {
      setTimeout(() => {
        notificationSounds.celebrate();
      }, 300);
    }
  }, [prefersReducedMotion]);

  const onSubscriptionCancelled = useCallback(() => {
    if (!prefersReducedMotion) {
      haptics.vibrate('medium');
    }
    soundEffects.success();
  }, [prefersReducedMotion]);

  const onTransactionFailed = useCallback(() => {
    onError();
  }, [onError]);

  const onLargeTransactionWarning = useCallback(() => {
    onWarning();
  }, [onWarning]);

  return {
    onDeposit,
    onWithdraw,
    onTransfer,
    onPayment,
    onGoalContribution,
    onDebtPayment,
    onSubscriptionCancelled,
    onTransactionFailed,
    onLargeTransactionWarning,
  };
}
