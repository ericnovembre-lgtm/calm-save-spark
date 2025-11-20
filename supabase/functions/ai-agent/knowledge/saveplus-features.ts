export const SAVEPLUS_FEATURES = {
  navigation: {
    keyboard_shortcuts: {
      '?': 'Open help menu',
      'g + d': 'Go to dashboard',
      'g + g': 'Go to goals',
      'g + b': 'Go to budget',
      'g + t': 'Go to transactions',
      'g + a': 'Go to analytics',
      '/': 'Focus search',
    },
    main_sections: {
      dashboard: 'Overview of financial health with key metrics',
      savings_hub: 'Goal management, automation, and savings tracking',
      budget_hub: 'Category budgets, spending limits, and alerts',
      analytics_hub: 'Insights, trends, forecasts, and reports',
      premium_hub: 'Advanced tools for Premium+ subscribers',
      ai_hub: 'Access to all 6 specialized AI agents',
      transactions: 'Transaction history, categorization, and search',
    },
  },
  
  integrations: {
    plaid: {
      description: 'Bank account linking for automatic transaction sync',
      supported_institutions: '11,000+ banks',
      security: 'Bank-level encryption, no password storage',
      troubleshooting: {
        'Connection failed': 'Check bank credentials, try different browser',
        'Transactions not syncing': 'Reconnect account, verify permissions',
        'Account not found': 'Some banks require 2FA, try again with code',
      },
    },
  },
  
  subscription_tiers: {
    free: {
      price: '$0/month',
      features: [
        'Basic tracking',
        'Manual transactions',
        'Simple budgets',
        'Limited AI (10 msgs/month)',
      ],
      limitations: ['No automation', 'No bank linking', 'Limited analytics'],
    },
    premium: {
      price: '$19/month',
      features: [
        'Everything in Free',
        'Unlimited AI agents',
        'Bank linking',
        'Advanced analytics',
        'Automation rules',
        'Goal projections',
      ],
      best_for: 'Individuals serious about financial optimization',
    },
    business: {
      price: '$49/month',
      features: [
        'Everything in Premium',
        'Multi-account',
        'Team collaboration',
        'API access',
        'Priority support',
      ],
      best_for: 'Small businesses and freelancers',
    },
    enterprise: {
      price: '$99+/month',
      features: [
        'Everything in Business',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantees',
        'White-label options',
      ],
      best_for: 'Large organizations with custom needs',
    },
  },
  
  ai_agents: {
    financial_coach: 'General financial advice, budgeting, spending optimization',
    onboarding_guide: 'Account setup, KYC, bank linking help',
    tax_assistant: 'Tax deductions, estimates, planning',
    investment_research: 'Market analysis, portfolio insights',
    debt_advisor: 'Debt payoff strategies, consolidation advice',
    life_planner: 'Major life events (home, education, retirement)',
    help_agent: 'Navigation, troubleshooting, feature discovery',
  },
  
  common_issues: {
    'KYC verification delayed':
      'Usually takes 1-3 business days. Check email for requests.',
    'Transaction not categorized':
      'Use transaction detail page to recategorize manually.',
    'Goal projection seems off':
      'Ensure consistent contributions and accurate target date.',
    'Budget keeps going over':
      'Review category limits, set alerts, enable smart suggestions.',
    'Performance slow':
      'Clear browser cache, check internet connection, try incognito mode.',
    'Bank account won\'t connect':
      'Verify credentials, try different browser, check if 2FA is required.',
  },
  
  page_map: {
    '/': 'Landing Page - Learn about $ave+',
    '/dashboard': 'Dashboard - Financial overview',
    '/goals': 'Goals - Savings goal management',
    '/budget': 'Budget - Category budgets and spending',
    '/transactions': 'Transactions - Transaction history',
    '/analytics': 'Analytics - Spending insights and trends',
    '/settings': 'Settings - Account preferences',
    '/ai-agents': 'AI Hub - All AI financial agents',
    '/savings-hub': 'Savings Hub - Comprehensive savings tools',
    '/budget-hub': 'Budget Hub - Advanced budgeting features',
    '/analytics-hub': 'Analytics Hub - Deep financial insights',
  },
};
