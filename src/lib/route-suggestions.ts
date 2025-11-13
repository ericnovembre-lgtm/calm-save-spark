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
  { path: '/dashboard', label: 'Dashboard', description: 'View your financial overview', keywords: ['dash', 'home', 'main', 'overview'] },
  { path: '/goals', label: 'Goals', description: 'Manage your savings goals', keywords: ['goal', 'target', 'objective', 'saving'] },
  { path: '/transactions', label: 'Transactions', description: 'View your transaction history', keywords: ['transaction', 'transfer', 'payment', 'history'] },
  { path: '/budget', label: 'Budget', description: 'Track your budget and spending', keywords: ['budget', 'spend', 'expense'] },
  { path: '/insights', label: 'Insights', description: 'Get financial insights and analytics', keywords: ['insight', 'analytic', 'report'] },
  { path: '/settings', label: 'Settings', description: 'Manage your account settings', keywords: ['setting', 'config', 'preference', 'account'] },
  { path: '/help', label: 'Help Center', description: 'Get help and support', keywords: ['help', 'support', 'faq', 'question'] },
  { path: '/coach', label: 'AI Coach', description: 'Chat with your financial coach', keywords: ['coach', 'chat', 'ai', 'assistant'] },
  { path: '/automations', label: 'Automations', description: 'Set up automated savings rules', keywords: ['automation', 'rule', 'automatic'] },
  { path: '/pots', label: 'Pots', description: 'Organize savings in pots', keywords: ['pot', 'jar', 'envelope'] },
  { path: '/achievements', label: 'Achievements', description: 'View your achievements and badges', keywords: ['achievement', 'badge', 'reward', 'trophy'] },
  { path: '/analytics', label: 'Analytics', description: 'Advanced financial analytics', keywords: ['analytic', 'metric', 'stat'] },
  { path: '/credit', label: 'Credit Score', description: 'Monitor your credit score', keywords: ['credit', 'score', 'rating'] },
  { path: '/investments', label: 'Investments', description: 'Track your investments', keywords: ['invest', 'stock', 'portfolio'] },
  { path: '/debts', label: 'Debts', description: 'Manage your debts', keywords: ['debt', 'loan', 'payoff'] },
  { path: '/subscriptions', label: 'Subscriptions', description: 'Manage your subscriptions', keywords: ['subscription', 'recurring', 'membership'] },
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
