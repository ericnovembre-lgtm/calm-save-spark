import { useMemo } from 'react';
import { useFeatureAccess } from './useFeatureAccess';

/**
 * Validates subscription amounts and provides security checks
 */
export function useSubscriptionValidation() {
  const { subscriptionAmount, features } = useFeatureAccess();

  const validation = useMemo(() => {
    // Amount validation
    const isValidAmount = (amount: number): boolean => {
      return amount >= 0 && amount <= 15 && Number.isInteger(amount);
    };

    // Security: Check if subscription matches features
    const validateFeatureAccess = (requiredAmount: number): boolean => {
      if (subscriptionAmount < requiredAmount) {
        console.warn(`[Security] Feature requires $${requiredAmount} but user has $${subscriptionAmount}`);
        return false;
      }
      return true;
    };

    // Edge case: Prevent downgrade if it would violate current usage
    const canDowngradeTo = (newAmount: number, currentUsage: {
      goals: number;
      pots: number;
      automationRules: number;
    }): { allowed: boolean; reason?: string } => {
      if (!isValidAmount(newAmount)) {
        return { allowed: false, reason: 'Invalid subscription amount' };
      }

      // Calculate what features the new amount would provide
      // This is a simplified check - in production, fetch from compute_user_features
      const newMaxGoals = newAmount >= 9 ? 999 : newAmount >= 5 ? 10 : newAmount >= 3 ? 7 : newAmount >= 1 ? 5 : 3;
      const newMaxPots = newAmount >= 10 ? 999 : newAmount >= 6 ? 15 : newAmount >= 2 ? 10 : 5;
      const newMaxRules = newAmount >= 7 ? 5 : newAmount >= 3 ? 2 : 0;

      if (currentUsage.goals > newMaxGoals) {
        return { 
          allowed: false, 
          reason: `You have ${currentUsage.goals} goals but this plan only allows ${newMaxGoals}. Please remove some goals first.` 
        };
      }

      if (currentUsage.pots > newMaxPots) {
        return { 
          allowed: false, 
          reason: `You have ${currentUsage.pots} pots but this plan only allows ${newMaxPots}. Please remove some pots first.` 
        };
      }

      if (currentUsage.automationRules > newMaxRules) {
        return { 
          allowed: false, 
          reason: `You have ${currentUsage.automationRules} automation rules but this plan only allows ${newMaxRules}. Please remove some rules first.` 
        };
      }

      return { allowed: true };
    };

    // Rate limiting check for subscription changes
    const lastChangeKey = 'last_subscription_change';
    const canChangeSubscription = (): { allowed: boolean; reason?: string } => {
      try {
        const lastChange = localStorage.getItem(lastChangeKey);
        if (!lastChange) return { allowed: true };

        const lastChangeDate = new Date(lastChange);
        const daysSinceChange = (Date.now() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24);

        // Allow max 3 changes per month (every 10 days)
        if (daysSinceChange < 10) {
          return { 
            allowed: false, 
            reason: `You can change your subscription again in ${Math.ceil(10 - daysSinceChange)} days` 
          };
        }

        return { allowed: true };
      } catch {
        return { allowed: true }; // If localStorage fails, allow the change
      }
    };

    const recordSubscriptionChange = () => {
      try {
        localStorage.setItem(lastChangeKey, new Date().toISOString());
      } catch {
        // Ignore localStorage errors
      }
    };

    return {
      isValidAmount,
      validateFeatureAccess,
      canDowngradeTo,
      canChangeSubscription,
      recordSubscriptionChange,
    };
  }, [subscriptionAmount, features]);

  return validation;
}
