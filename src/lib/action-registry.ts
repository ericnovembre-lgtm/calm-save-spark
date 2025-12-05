import type { CoPilotAction, ActionCategory } from '@/types/copilot';

type NavigateFunction = (path: string) => void;
type ThemeFunction = (theme: 'light' | 'dark' | 'system') => void;
type ModalFunction = (modalId: string) => void;
type SpotlightFunction = (elementId: string) => void;

interface ActionRegistryConfig {
  navigate: NavigateFunction;
  setTheme: ThemeFunction;
  openModal: ModalFunction;
  spotlight: SpotlightFunction;
}

/**
 * Creates the action registry with injected dependencies
 */
export function createActionRegistry(config: ActionRegistryConfig): CoPilotAction[] {
  const { navigate, setTheme, openModal, spotlight } = config;
  
  return [
    // =========================================
    // NAVIGATION ACTIONS
    // =========================================
    {
      id: 'nav_dashboard',
      category: 'NAVIGATION' as ActionCategory,
      description: 'Navigate to the main dashboard',
      keywords: ['dashboard', 'home', 'overview', 'main'],
      execute: () => navigate('/dashboard'),
      relatedElementId: 'nav-dashboard',
    },
    {
      id: 'nav_goals',
      category: 'NAVIGATION' as ActionCategory,
      description: 'Navigate to savings goals page',
      keywords: ['goals', 'savings', 'targets', 'save'],
      execute: () => navigate('/goals'),
      relatedElementId: 'nav-goals',
    },
    {
      id: 'nav_budget',
      category: 'NAVIGATION' as ActionCategory,
      description: 'Navigate to budget management page',
      keywords: ['budget', 'spending', 'allocate', 'plan'],
      execute: () => navigate('/budget'),
      relatedElementId: 'nav-budget',
    },
    {
      id: 'nav_transactions',
      category: 'NAVIGATION' as ActionCategory,
      description: 'Navigate to transactions list',
      keywords: ['transactions', 'history', 'payments', 'purchases'],
      execute: () => navigate('/transactions'),
      relatedElementId: 'nav-transactions',
    },
    {
      id: 'nav_investments',
      category: 'NAVIGATION' as ActionCategory,
      description: 'Navigate to investments portfolio',
      keywords: ['investments', 'portfolio', 'stocks', 'invest'],
      execute: () => navigate('/investments'),
      relatedElementId: 'nav-investments',
    },
    {
      id: 'nav_coach',
      category: 'NAVIGATION' as ActionCategory,
      description: 'Navigate to AI financial coach',
      keywords: ['coach', 'advisor', 'advice', 'help'],
      execute: () => navigate('/coach'),
      relatedElementId: 'nav-coach',
    },
    {
      id: 'nav_digital_twin',
      category: 'NAVIGATION' as ActionCategory,
      description: 'Navigate to digital twin simulator',
      keywords: ['digital twin', 'simulator', 'future', 'projection'],
      execute: () => navigate('/digital-twin'),
      relatedElementId: 'nav-digital-twin',
    },
    {
      id: 'nav_settings',
      category: 'NAVIGATION' as ActionCategory,
      description: 'Navigate to settings page',
      keywords: ['settings', 'preferences', 'configure', 'options'],
      execute: () => navigate('/settings'),
      relatedElementId: 'nav-settings',
    },
    {
      id: 'nav_subscriptions',
      category: 'NAVIGATION' as ActionCategory,
      description: 'Navigate to subscriptions page',
      keywords: ['subscriptions', 'recurring', 'monthly', 'bills'],
      execute: () => navigate('/subscriptions'),
      relatedElementId: 'nav-subscriptions',
    },
    {
      id: 'nav_debts',
      category: 'NAVIGATION' as ActionCategory,
      description: 'Navigate to debt management page',
      keywords: ['debts', 'loans', 'credit', 'payoff'],
      execute: () => navigate('/debts'),
      relatedElementId: 'nav-debts',
    },
    {
      id: 'nav_guardian',
      category: 'NAVIGATION' as ActionCategory,
      description: 'Navigate to security center',
      keywords: ['security', 'guardian', 'protection', 'safe'],
      execute: () => navigate('/guardian'),
      relatedElementId: 'nav-guardian',
    },
    {
      id: 'nav_analytics',
      category: 'NAVIGATION' as ActionCategory,
      description: 'Navigate to analytics page',
      keywords: ['analytics', 'insights', 'reports', 'data'],
      execute: () => navigate('/analytics'),
      relatedElementId: 'nav-analytics',
    },
    
    // =========================================
    // THEME ACTIONS
    // =========================================
    {
      id: 'theme_dark',
      category: 'THEME' as ActionCategory,
      description: 'Switch to dark mode',
      keywords: ['dark mode', 'dark theme', 'night mode', 'dark'],
      execute: () => setTheme('dark'),
      relatedElementId: 'theme-toggle',
    },
    {
      id: 'theme_light',
      category: 'THEME' as ActionCategory,
      description: 'Switch to light mode',
      keywords: ['light mode', 'light theme', 'day mode', 'light'],
      execute: () => setTheme('light'),
      relatedElementId: 'theme-toggle',
    },
    {
      id: 'theme_system',
      category: 'THEME' as ActionCategory,
      description: 'Use system theme preference',
      keywords: ['system theme', 'auto theme', 'default theme'],
      execute: () => setTheme('system'),
      relatedElementId: 'theme-toggle',
    },
    
    // =========================================
    // MODAL ACTIONS
    // =========================================
    {
      id: 'modal_add_goal',
      category: 'MODAL' as ActionCategory,
      description: 'Open the create goal dialog',
      keywords: ['create goal', 'new goal', 'add goal', 'start saving'],
      execute: () => openModal('add-goal'),
      relatedElementId: 'btn-add-goal',
    },
    {
      id: 'modal_create_budget',
      category: 'MODAL' as ActionCategory,
      description: 'Open the create budget dialog',
      keywords: ['create budget', 'new budget', 'add budget', 'set budget'],
      execute: () => openModal('create-budget'),
      relatedElementId: 'btn-create-budget',
    },
    {
      id: 'modal_add_transaction',
      category: 'MODAL' as ActionCategory,
      description: 'Open the add transaction dialog',
      keywords: ['add transaction', 'new transaction', 'log expense', 'record payment'],
      execute: () => openModal('add-transaction'),
      relatedElementId: 'btn-add-transaction',
    },
    {
      id: 'modal_transfer',
      category: 'MODAL' as ActionCategory,
      description: 'Open the transfer dialog',
      keywords: ['transfer', 'move money', 'send money'],
      execute: () => openModal('transfer'),
      relatedElementId: 'btn-transfer',
    },
    {
      id: 'modal_invest',
      category: 'MODAL' as ActionCategory,
      description: 'Open the invest dialog',
      keywords: ['invest', 'buy stocks', 'purchase'],
      execute: () => openModal('invest'),
      relatedElementId: 'btn-invest',
    },
    {
      id: 'modal_debt_payment',
      category: 'MODAL' as ActionCategory,
      description: 'Open the debt payment dialog',
      keywords: ['pay debt', 'make payment', 'pay off'],
      execute: () => openModal('debt-payment'),
      relatedElementId: 'btn-debt-payment',
    },
    {
      id: 'modal_lockdown',
      category: 'MODAL' as ActionCategory,
      description: 'Open the security lockdown dialog',
      keywords: ['lockdown', 'emergency', 'freeze', 'panic'],
      execute: () => openModal('lockdown'),
      relatedElementId: 'btn-lockdown',
    },
    
    // =========================================
    // UI CONTROL ACTIONS
    // =========================================
    {
      id: 'spotlight_balance',
      category: 'UI_CONTROL' as ActionCategory,
      description: 'Highlight the balance card',
      keywords: ['show balance', 'where is balance', 'find balance'],
      execute: () => spotlight('balance-card'),
      relatedElementId: 'balance-card',
    },
    {
      id: 'spotlight_goals',
      category: 'UI_CONTROL' as ActionCategory,
      description: 'Highlight the goals widget',
      keywords: ['show goals', 'where are goals', 'find goals'],
      execute: () => spotlight('goals-widget'),
      relatedElementId: 'goals-widget',
    },
    {
      id: 'spotlight_spending',
      category: 'UI_CONTROL' as ActionCategory,
      description: 'Highlight the spending chart',
      keywords: ['show spending', 'where is spending', 'find spending'],
      execute: () => spotlight('spending-chart'),
      relatedElementId: 'spending-chart',
    },
  ];
}

/**
 * Find matching action based on user input
 */
export function findMatchingAction(
  input: string, 
  actions: CoPilotAction[]
): CoPilotAction | null {
  const normalizedInput = input.toLowerCase().trim();
  
  // Check each action's keywords
  for (const action of actions) {
    for (const keyword of action.keywords) {
      if (normalizedInput.includes(keyword.toLowerCase())) {
        return action;
      }
    }
  }
  
  return null;
}

/**
 * Get actions by category
 */
export function getActionsByCategory(
  actions: CoPilotAction[], 
  category: ActionCategory
): CoPilotAction[] {
  return actions.filter(action => action.category === category);
}
