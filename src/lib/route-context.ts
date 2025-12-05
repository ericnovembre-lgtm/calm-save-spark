import type { RouteContext, ContextualGreeting } from '@/types/copilot';

/**
 * Route-specific context configurations for the Co-Pilot
 */
const routeContexts: Record<string, RouteContext> = {
  '/dashboard': {
    route: '/dashboard',
    title: 'Dashboard',
    greeting: 'Ready to review your financial overview?',
    suggestions: [
      'Show my spending summary',
      'How are my goals progressing?',
      'Any unusual transactions?',
    ],
    relevantActions: ['nav_goals', 'nav_budget', 'nav_transactions', 'theme_toggle'],
  },
  '/investments': {
    route: '/investments',
    title: 'Investments',
    greeting: 'Ready to review your portfolio performance?',
    suggestions: [
      'How is my portfolio doing?',
      'Show me top gainers',
      'Analyze my asset allocation',
    ],
    relevantActions: ['nav_dashboard', 'modal_invest', 'theme_toggle'],
  },
  '/goals': {
    route: '/goals',
    title: 'Savings Goals',
    greeting: "Let's check on your savings goals!",
    suggestions: [
      'How close am I to my goals?',
      'Add money to a goal',
      'Create a new goal',
    ],
    relevantActions: ['modal_add_goal', 'nav_dashboard', 'nav_budget'],
  },
  '/budget': {
    route: '/budget',
    title: 'Budget',
    greeting: "Let's review your budget together.",
    suggestions: [
      'Am I on track this month?',
      'Which category am I overspending?',
      'Optimize my budget',
    ],
    relevantActions: ['modal_create_budget', 'nav_transactions', 'nav_dashboard'],
  },
  '/transactions': {
    route: '/transactions',
    title: 'Transactions',
    greeting: 'Looking for a specific transaction?',
    suggestions: [
      'Find my largest expense',
      'Show recurring charges',
      'Categorize my transactions',
    ],
    relevantActions: ['modal_add_transaction', 'nav_budget', 'nav_dashboard'],
  },
  '/coach': {
    route: '/coach',
    title: 'AI Coach',
    greeting: "I'm your financial coach. How can I help?",
    suggestions: [
      'Give me financial advice',
      'Review my spending habits',
      'Plan for the future',
    ],
    relevantActions: ['nav_dashboard', 'nav_goals', 'nav_digital_twin'],
  },
  '/digital-twin': {
    route: '/digital-twin',
    title: 'Digital Twin',
    greeting: 'Ready to simulate your financial future?',
    suggestions: [
      'Run a what-if scenario',
      'Project my net worth',
      'Add a life event',
    ],
    relevantActions: ['modal_scenario', 'nav_coach', 'nav_investments'],
  },
  '/settings': {
    route: '/settings',
    title: 'Settings',
    greeting: 'Need help with your settings?',
    suggestions: [
      'Switch to dark mode',
      'Update my notifications',
      'Manage my account',
    ],
    relevantActions: ['theme_toggle', 'nav_dashboard'],
  },
  '/subscriptions': {
    route: '/subscriptions',
    title: 'Subscriptions',
    greeting: "Let's review your recurring payments.",
    suggestions: [
      'Find unused subscriptions',
      'Calculate my monthly subscriptions',
      'Cancel a subscription',
    ],
    relevantActions: ['modal_add_subscription', 'nav_budget', 'nav_transactions'],
  },
  '/debts': {
    route: '/debts',
    title: 'Debts',
    greeting: "Let's work on your debt payoff strategy.",
    suggestions: [
      'Show my debt payoff timeline',
      'Compare payoff strategies',
      'Make a payment',
    ],
    relevantActions: ['modal_debt_payment', 'nav_budget', 'nav_goals'],
  },
  '/credit': {
    route: '/credit',
    title: 'Credit Score',
    greeting: 'Ready to check your credit health?',
    suggestions: [
      'How can I improve my score?',
      'Show credit factors',
      'Track my progress',
    ],
    relevantActions: ['nav_debts', 'nav_dashboard'],
  },
  '/guardian': {
    route: '/guardian',
    title: 'Security Center',
    greeting: 'Your financial security is my priority.',
    suggestions: [
      'Check my security status',
      'Review active sessions',
      'Scan for vulnerabilities',
    ],
    relevantActions: ['modal_lockdown', 'nav_settings', 'nav_dashboard'],
  },
  '/analytics': {
    route: '/analytics',
    title: 'Analytics',
    greeting: "Let's dive into your financial analytics.",
    suggestions: [
      'Show spending trends',
      'Compare to last month',
      'Identify savings opportunities',
    ],
    relevantActions: ['nav_dashboard', 'nav_budget', 'nav_transactions'],
  },
};

const defaultContext: RouteContext = {
  route: '/',
  title: 'Home',
  greeting: 'How can I help you today?',
  suggestions: [
    'Show my dashboard',
    'Check my balance',
    'Go to settings',
  ],
  relevantActions: ['nav_dashboard', 'nav_settings', 'theme_toggle'],
};

/**
 * Get the route context for a given path
 */
export function getRouteContext(pathname: string): RouteContext {
  // Exact match first
  if (routeContexts[pathname]) {
    return routeContexts[pathname];
  }
  
  // Check for partial matches (e.g., /goals/123 should match /goals)
  const basePath = '/' + pathname.split('/')[1];
  if (routeContexts[basePath]) {
    return routeContexts[basePath];
  }
  
  return defaultContext;
}

/**
 * Get contextual greeting based on route and time of day
 */
export function getContextualGreeting(pathname: string): ContextualGreeting {
  const context = getRouteContext(pathname);
  const hour = new Date().getHours();
  
  let timeGreeting = '';
  if (hour < 12) {
    timeGreeting = 'Good morning! ';
  } else if (hour < 17) {
    timeGreeting = 'Good afternoon! ';
  } else {
    timeGreeting = 'Good evening! ';
  }
  
  return {
    text: timeGreeting + context.greeting,
    suggestions: context.suggestions,
  };
}

/**
 * Get relevant actions for a route
 */
export function getRelevantActions(pathname: string): string[] {
  const context = getRouteContext(pathname);
  return context.relevantActions;
}
