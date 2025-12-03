/**
 * Route suggestions utility
 * Provides intelligent URL suggestions based on similarity and keyword matching
 */

export interface RouteSuggestion {
  path: string;
  label: string;
  description: string;
  similarity: number;
}

const validRoutes = [
  // Main hubs
  { path: '/dashboard', label: 'Dashboard', description: 'View your financial overview', keywords: ['dash', 'home', 'main', 'overview'] },
  { path: '/hubs/manage-money', label: 'Manage Money Hub', description: 'All money management tools', keywords: ['money', 'manage', 'hub', 'spending'] },
  { path: '/hubs/grow-wealth', label: 'Grow Wealth Hub', description: 'Build your financial future', keywords: ['wealth', 'grow', 'hub', 'investment'] },
  { path: '/hubs/ai-insights', label: 'AI & Insights Hub', description: 'AI-powered financial guidance', keywords: ['ai', 'insight', 'hub', 'intelligent'] },
  { path: '/hubs/lifestyle', label: 'Lifestyle Hub', description: 'Life stage financial tools', keywords: ['lifestyle', 'hub', 'family', 'student'] },
  { path: '/hubs/premium', label: 'Premium Hub', description: 'Advanced financial solutions', keywords: ['premium', 'hub', 'advanced', 'pro'] },
  
  // Money management
  { path: '/budget', label: 'Budget', description: 'Track your budget and spending', keywords: ['budget', 'spend', 'expense', 'category'] },
  { path: '/transactions', label: 'Transactions', description: 'View your transaction history', keywords: ['transaction', 'transfer', 'payment', 'history'] },
  { path: '/subscriptions', label: 'Subscriptions', description: 'Manage your subscriptions', keywords: ['subscription', 'recurring', 'membership'] },
  { path: '/debts', label: 'Debts', description: 'Manage your debts', keywords: ['debt', 'loan', 'payoff', 'owe'] },
  { path: '/pots', label: 'Pots', description: 'Organize savings in pots', keywords: ['pot', 'jar', 'envelope', 'save'] },
  { path: '/automations', label: 'Automations', description: 'Set up automated savings rules', keywords: ['automation', 'rule', 'automatic', 'schedule'] },
  { path: '/bill-negotiation', label: 'Bill Negotiation', description: 'Save money on recurring bills', keywords: ['bill', 'negotiate', 'save', 'reduce'] },
  { path: '/accounts', label: 'Accounts', description: 'Connect and manage accounts', keywords: ['account', 'bank', 'connect', 'link'] },
  
  // Wealth building
  { path: '/goals', label: 'Goals', description: 'Manage your savings goals', keywords: ['goal', 'target', 'objective', 'saving'] },
  { path: '/investments', label: 'Investments', description: 'Track your investments', keywords: ['invest', 'stock', 'portfolio', 'market'] },
  { path: '/credit', label: 'Credit Score', description: 'Monitor your credit score', keywords: ['credit', 'score', 'rating', 'report'] },
  { path: '/wallet', label: 'Wallet', description: 'Manage your digital wallet', keywords: ['wallet', 'digital', 'money', 'balance'] },
  { path: '/card', label: 'Card', description: 'Your $ave+ secured credit card', keywords: ['card', 'credit', 'debit', 'secured'] },
  { path: '/achievements', label: 'Achievements', description: 'View your achievements and badges', keywords: ['achievement', 'badge', 'reward', 'trophy'] },
  
  // AI & Insights
  { path: '/coach', label: 'AI Coach', description: 'Chat with your financial coach', keywords: ['coach', 'chat', 'ai', 'assistant', 'help'] },
  { path: '/ai-agents', label: 'AI Agents', description: 'Autonomous financial assistants', keywords: ['agent', 'ai', 'autonomous', 'assistant', 'hub'] },
  { path: '/digital-twin', label: 'Digital Twin', description: 'Your financial simulation', keywords: ['twin', 'digital', 'simulate', 'forecast', 'life', 'planner', 'memory'] },
  { path: '/analytics', label: 'Analytics', description: 'Financial insights and analytics', keywords: ['analytic', 'metric', 'stat', 'report', 'insight', 'data'] },
  { path: '/guardian', label: 'Guardian', description: 'Behavioral spending protection', keywords: ['guardian', 'protect', 'behavior', 'control', 'security'] },
  
  // Lifestyle
  { path: '/family', label: 'Family', description: 'Family savings and allowances', keywords: ['family', 'allowance', 'kids', 'children'] },
  { path: '/student', label: 'Student', description: 'Student budgeting and loans', keywords: ['student', 'college', 'loan', 'education'] },
  { path: '/business-os', label: 'Business OS', description: 'Business and freelancer financial tools', keywords: ['business', 'freelance', 'self-employed', 'os', 'entrepreneur', 'company', 'small'] },
  { path: '/literacy', label: 'Financial Literacy', description: 'Learn about personal finance', keywords: ['learn', 'literacy', 'education', 'course'] },
  { path: '/sustainability', label: 'Sustainability', description: 'Track carbon footprint', keywords: ['sustainability', 'carbon', 'green', 'eco'] },
  { path: '/financial-health', label: 'Financial Health', description: 'Overall financial wellness score', keywords: ['health', 'wellness', 'score', 'overall'] },
  { path: '/life-events', label: 'Life Events', description: 'Plan for major life changes', keywords: ['life', 'event', 'milestone', 'change'] },
  
  // Premium features
  { path: '/alternatives-portal', label: 'Alternatives Portal', description: 'Alternative investments access', keywords: ['alternative', 'investment', 'premium', 'advanced'] },
  { path: '/family-office', label: 'Family Office', description: 'High-net-worth financial management', keywords: ['family', 'office', 'wealth', 'premium'] },
  { path: '/corporate-wellness', label: 'Corporate Wellness', description: 'Employee financial wellness programs', keywords: ['corporate', 'wellness', 'employee', 'company'] },
  { path: '/investments', label: 'Investments', description: 'Portfolio and investment management', keywords: ['investment', 'manager', 'portfolio', 'advanced', 'tax', 'rebalancing'] },
  { path: '/lifesim', label: 'LifeSim', description: 'Simulate future financial scenarios', keywords: ['life', 'sim', 'simulate', 'scenario'] },
  { path: '/refinancing-hub', label: 'Refinancing Hub', description: 'Debt refinancing opportunities', keywords: ['refinance', 'refi', 'debt', 'loan'] },
  { path: '/defi-manager', label: 'DeFi Manager', description: 'Decentralized finance management', keywords: ['defi', 'crypto', 'blockchain', 'decentralized'] },
  { path: '/tax-documents', label: 'Tax Documents', description: 'Tax preparation and filing', keywords: ['tax', 'document', 'filing', 'return'] },
  { path: '/gamification', label: 'Gamification', description: 'Financial challenges and rewards', keywords: ['game', 'challenge', 'reward', 'fun'] },
  
  // Other features
  { path: '/features-hub', label: 'Features Hub', description: 'Explore all features', keywords: ['feature', 'hub', 'all', 'explore'] },
  { path: '/leaderboard', label: 'Leaderboard', description: 'Compare with other savers', keywords: ['leaderboard', 'rank', 'compare', 'compete'] },
  { path: '/social', label: 'Social', description: 'Connect with other users', keywords: ['social', 'community', 'connect', 'share'] },
  { path: '/integrations', label: 'Integrations', description: 'Connect external services', keywords: ['integration', 'connect', 'service', 'api'] },
  { path: '/settings', label: 'Settings', description: 'Manage your account settings', keywords: ['setting', 'config', 'preference', 'account'] },
  { path: '/help', label: 'Help Center', description: 'Get help and support', keywords: ['help', 'support', 'faq', 'question'] },
];

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score (0-1) between two strings
 */
function calculateSimilarity(attempted: string, valid: string): number {
  const distance = levenshteinDistance(
    attempted.toLowerCase().replace(/[^a-z0-9]/g, ''),
    valid.toLowerCase().replace(/[^a-z0-9]/g, '')
  );
  const maxLength = Math.max(attempted.length, valid.length);
  return maxLength === 0 ? 0 : 1 - distance / maxLength;
}

/**
 * Get route suggestions based on attempted URL
 */
export function getRouteSuggestions(attemptedUrl: string): RouteSuggestion[] {
  const cleanUrl = attemptedUrl.toLowerCase().replace(/^\/+|\/+$/g, '');

  const suggestions = validRoutes
    .map(route => {
      const pathSimilarity = calculateSimilarity(cleanUrl, route.path.slice(1));
      const keywordMatch = route.keywords.some(keyword => 
        cleanUrl.includes(keyword) || keyword.includes(cleanUrl)
      );
      
      // Boost score if keyword matches
      const finalScore = keywordMatch ? Math.max(pathSimilarity, 0.7) : pathSimilarity;

      return {
        path: route.path,
        label: route.label,
        description: route.description,
        similarity: finalScore,
      };
    })
    .filter(s => s.similarity > 0.5)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  return suggestions;
}

/**
 * Get contextual help based on URL pattern
 */
export function getContextualHelp(attemptedUrl: string): { title: string; description: string; link: string } | null {
  const url = attemptedUrl.toLowerCase();

  if (url.includes('goal')) {
    return {
      title: 'Looking for Goals?',
      description: 'Set and track your savings goals to reach your financial targets.',
      link: '/goals',
    };
  }

  if (url.includes('transaction') || url.includes('transfer')) {
    return {
      title: 'Looking for Transactions?',
      description: 'View and manage all your financial transactions in one place.',
      link: '/transactions',
    };
  }

  if (url.includes('setting') || url.includes('config') || url.includes('account')) {
    return {
      title: 'Looking for Settings?',
      description: 'Customize your account and manage your preferences.',
      link: '/settings',
    };
  }

  if (url.includes('help') || url.includes('support')) {
    return {
      title: 'Need Help?',
      description: 'Visit our help center for guides and support.',
      link: '/help',
    };
  }

  return null;
}
