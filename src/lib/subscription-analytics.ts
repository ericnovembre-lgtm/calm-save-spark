import { trackEvent } from './analytics';

/**
 * Analytics tracking for subscription events
 */

export const trackSubscriptionEvent = {
  // Pricing page interactions
  sliderMoved: (amount: number, previousAmount: number) => {
    trackEvent('subscription_slider_interaction', {
      selected_amount: amount,
      previous_amount: previousAmount,
      direction: amount > previousAmount ? 'upgrade' : 'downgrade',
    });
  },

  quickSelectClicked: (amount: number) => {
    trackEvent('subscription_quick_select', {
      amount,
    });
  },

  annualToggled: (isAnnual: boolean, amount: number) => {
    trackEvent('subscription_billing_toggle', {
      billing_type: isAnnual ? 'annual' : 'monthly',
      amount,
      estimated_savings: isAnnual ? (amount * 12 * 0.15) : 0,
    });
  },

  // Checkout flow
  checkoutStarted: (amount: number, billing: 'monthly' | 'annual') => {
    trackEvent('subscription_checkout_started', {
      amount,
      billing_interval: billing,
      value: billing === 'annual' ? amount * 12 * 0.85 : amount,
    });
  },

  checkoutCompleted: (amount: number, billing: 'monthly' | 'annual', transactionId?: string) => {
    trackEvent('subscription_checkout_completed', {
      amount,
      billing_interval: billing,
      transaction_id: transactionId,
      value: billing === 'annual' ? amount * 12 * 0.85 : amount,
    });
  },

  checkoutAbandoned: (amount: number, step: string) => {
    trackEvent('subscription_checkout_abandoned', {
      amount,
      abandonment_step: step,
    });
  },

  // Subscription changes
  subscriptionCreated: (amount: number, features: string[]) => {
    trackEvent('subscription_created', {
      amount,
      features_unlocked: features,
      is_trial: true,
    });
  },

  subscriptionUpgraded: (previousAmount: number, newAmount: number, reason: string = 'user_initiated') => {
    trackEvent('subscription_upgraded', {
      previous_amount: previousAmount,
      new_amount: newAmount,
      increase: newAmount - previousAmount,
      reason,
    });
  },

  subscriptionDowngraded: (previousAmount: number, newAmount: number, reason: string = 'user_initiated') => {
    trackEvent('subscription_downgraded', {
      previous_amount: previousAmount,
      new_amount: newAmount,
      decrease: previousAmount - newAmount,
      reason,
    });
  },

  subscriptionCanceled: (amount: number, reason?: string, feedback?: string) => {
    trackEvent('subscription_canceled', {
      amount,
      cancellation_reason: reason,
      feedback,
    });
  },

  // Feature gate interactions
  featureLimitReached: (feature: string, currentLimit: number) => {
    trackEvent('feature_limit_reached', {
      feature_type: feature,
      current_limit: currentLimit,
    });
  },

  upgradePromptShown: (feature: string, suggestedAmount: number, currentAmount: number) => {
    trackEvent('upgrade_prompt_shown', {
      feature_locked: feature,
      suggested_amount: suggestedAmount,
      current_amount: currentAmount,
      potential_revenue: suggestedAmount - currentAmount,
    });
  },

  upgradePromptClicked: (feature: string, suggestedAmount: number) => {
    trackEvent('upgrade_prompt_clicked', {
      feature_locked: feature,
      suggested_amount: suggestedAmount,
      conversion_source: 'feature_gate',
    });
  },

  // Feature usage
  featureUsed: (feature: string, subscriptionAmount: number) => {
    trackEvent('premium_feature_used', {
      feature_name: feature,
      subscription_tier: subscriptionAmount,
    });
  },

  // Subscription management
  subscriptionPageViewed: (currentAmount: number) => {
    trackEvent('subscription_management_viewed', {
      current_amount: currentAmount,
    });
  },

  billingHistoryViewed: () => {
    trackEvent('billing_history_viewed', {});
  },

  // Free trial
  trialStarted: (amount: number) => {
    trackEvent('trial_started', {
      amount,
      trial_days: 14,
    });
  },

  trialEnding: (amount: number, daysRemaining: number) => {
    trackEvent('trial_ending_reminder', {
      amount,
      days_remaining: daysRemaining,
    });
  },

  trialConverted: (amount: number) => {
    trackEvent('trial_converted', {
      amount,
      value: amount,
    });
  },

  trialCanceled: (amount: number, daysUsed: number) => {
    trackEvent('trial_canceled', {
      amount,
      days_used: daysUsed,
    });
  },
};
