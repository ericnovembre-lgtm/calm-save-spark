export function determineSubscriptionTier(subscription: any): string {
  if (!subscription) return 'Free';
  
  const amount = parseFloat(subscription.subscription_amount || 0);
  if (amount >= 99) return 'Enterprise';
  if (amount >= 49) return 'Business';
  if (amount >= 19) return 'Premium';
  return 'Free';
}

export function getFeaturesByTier(tier: string): string[] {
  const featureMap: Record<string, string[]> = {
    'Free': [
      'Basic dashboard',
      'Manual transaction tracking',
      'Simple budgeting',
      'Financial Coach (limited)',
    ],
    'Premium': [
      'All Free features',
      'All 6 AI agents (unlimited)',
      'Advanced analytics',
      'Automation rules',
      'Bank linking (Plaid)',
      'Goal tracking with projections',
    ],
    'Business': [
      'All Premium features',
      'Multi-account management',
      'Team collaboration',
      'API access',
      'Priority support',
    ],
    'Enterprise': [
      'All Business features',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
      'White-label options',
    ],
  };
  
  return featureMap[tier] || featureMap['Free'];
}

export function getSubscriptionMessage(tier: string, requestingPremiumFeature: boolean = false): string {
  if (tier === 'Free' && requestingPremiumFeature) {
    return '\n\n💡 **Note:** This feature is available in Premium. Upgrade for unlimited AI agents, automation, and advanced analytics.';
  }
  
  if (tier === 'Premium') {
    return '\n\n✅ You have access to all AI agents and advanced features.';
  }
  
  if (tier === 'Business' || tier === 'Enterprise') {
    return `\n\n✅ You have access to all ${tier} features including team collaboration and priority support.`;
  }
  
  return '';
}
