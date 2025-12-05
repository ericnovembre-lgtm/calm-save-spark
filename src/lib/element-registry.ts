// =========================================
// Element Registry for Visual Tour Guide
// Maps data-copilot-id attributes to descriptions
// =========================================

import type { ElementInfo } from '@/types/copilot';

/**
 * Registry of UI elements the CoPilot can reference and highlight
 */
export const elementRegistry: Record<string, ElementInfo> = {
  // Dashboard elements
  'dashboard-shell': {
    id: 'dashboard-shell',
    label: 'Dashboard',
    description: 'Your personalized financial overview',
    route: '/dashboard',
  },
  'dashboard-balance': {
    id: 'dashboard-balance',
    label: 'Balance Card',
    description: 'Shows your total balance across all accounts',
    route: '/dashboard',
  },
  'dashboard-goals': {
    id: 'dashboard-goals',
    label: 'Goals Widget',
    description: 'Track progress on your savings goals',
    route: '/dashboard',
  },
  'dashboard-spending': {
    id: 'dashboard-spending',
    label: 'Spending Breakdown',
    description: 'View your spending by category',
    route: '/dashboard',
  },
  'dashboard-ai-insights': {
    id: 'dashboard-ai-insights',
    label: 'AI Insights',
    description: 'Personalized financial recommendations',
    route: '/dashboard',
  },
  'dashboard-quick-actions': {
    id: 'dashboard-quick-actions',
    label: 'Quick Actions',
    description: 'Shortcuts to common tasks like transfers and bill pay',
    route: '/dashboard',
  },
  'dashboard-stories': {
    id: 'dashboard-stories',
    label: 'Financial Stories',
    description: 'Quick updates on your financial activity',
    route: '/dashboard',
  },
  
  // Goals page elements
  'add-goal-button': {
    id: 'add-goal-button',
    label: 'Add Goal Button',
    description: 'Create a new savings goal',
    route: '/goals',
  },
  'goal-card': {
    id: 'goal-card',
    label: 'Goal Card',
    description: 'View and manage your savings goal',
    route: '/goals',
  },
  'goal-progress': {
    id: 'goal-progress',
    label: 'Goal Progress',
    description: 'Shows how close you are to reaching your goal',
    route: '/goals',
  },
  
  // Budget page elements
  'budget-category': {
    id: 'budget-category',
    label: 'Budget Category',
    description: 'Track spending in this category',
    route: '/budget',
  },
  'budget-progress': {
    id: 'budget-progress',
    label: 'Budget Progress',
    description: 'Shows spending against your budget limit',
    route: '/budget',
  },
  'add-budget-button': {
    id: 'add-budget-button',
    label: 'Add Budget Button',
    description: 'Create a new budget category',
    route: '/budget',
  },
  
  // Transactions page elements
  'transactions-page': {
    id: 'transactions-page',
    label: 'Transactions Page',
    description: 'View and manage all your transactions',
    route: '/transactions',
  },
  'transaction-list': {
    id: 'transaction-list',
    label: 'Transaction List',
    description: 'View all your transactions',
    route: '/transactions',
  },
  'transaction-filters': {
    id: 'transaction-filters',
    label: 'Transaction Filters',
    description: 'Filter transactions by date, category, or amount',
    route: '/transactions',
  },
  'transaction-search': {
    id: 'transaction-search',
    label: 'Transaction Search',
    description: 'Search for specific transactions',
    route: '/transactions',
  },
  'transaction-actions': {
    id: 'transaction-actions',
    label: 'Transaction Actions',
    description: 'Import, export, or add transactions',
    route: '/transactions',
  },
  'add-transaction-button': {
    id: 'add-transaction-button',
    label: 'Add Transaction',
    description: 'Manually add a new transaction',
    route: '/transactions',
  },
  'import-transactions': {
    id: 'import-transactions',
    label: 'Import Transactions',
    description: 'Import transactions from a file',
    route: '/transactions',
  },
  'export-transactions': {
    id: 'export-transactions',
    label: 'Export Transactions',
    description: 'Export your transactions to a file',
    route: '/transactions',
  },
  
  // Settings page elements
  'settings-page': {
    id: 'settings-page',
    label: 'Settings',
    description: 'Manage your account settings and preferences',
    route: '/settings',
  },
  'ai-control-center': {
    id: 'ai-control-center',
    label: 'AI Control Center',
    description: 'Smart, personalized settings powered by AI',
    route: '/settings',
  },
  'security-settings': {
    id: 'security-settings',
    label: 'Security Settings',
    description: 'Protect your account with security measures',
    route: '/settings',
  },
  'notification-settings': {
    id: 'notification-settings',
    label: 'Notification Settings',
    description: 'Configure your notification preferences',
    route: '/settings',
  },
  'display-preferences': {
    id: 'display-preferences',
    label: 'Display Preferences',
    description: 'Customize how information is displayed',
    route: '/settings',
  },
  'theme-toggle': {
    id: 'theme-toggle',
    label: 'Theme Toggle',
    description: 'Switch between light and dark mode',
    route: '/settings',
  },
  
  // Navigation elements
  'bottom-navigation': {
    id: 'bottom-navigation',
    label: 'Bottom Navigation',
    description: 'Navigate between main sections of the app',
    route: '*',
  },
  'nav-home': {
    id: 'nav-home',
    label: 'Home',
    description: 'Go to your dashboard',
    route: '*',
  },
  'nav-money': {
    id: 'nav-money',
    label: 'Money Hub',
    description: 'Manage your money',
    route: '*',
  },
  'nav-wealth': {
    id: 'nav-wealth',
    label: 'Wealth Hub',
    description: 'Grow your wealth',
    route: '*',
  },
  'nav-ai': {
    id: 'nav-ai',
    label: 'AI Hub',
    description: 'AI-powered insights',
    route: '*',
  },
  'nav-more': {
    id: 'nav-more',
    label: 'More',
    description: 'Access more features',
    route: '*',
  },
  'quick-add-button': {
    id: 'quick-add-button',
    label: 'Quick Add',
    description: 'Quickly add a new goal',
    route: '*',
  },
  'fab-menu-button': {
    id: 'fab-menu-button',
    label: 'Quick Actions Menu',
    description: 'Access quick actions like adding goals or transactions',
    route: '*',
  },
  
  // CoPilot elements
  'copilot-orb': {
    id: 'copilot-orb',
    label: 'CoPilot',
    description: 'Your AI financial assistant',
    route: '*',
  },
  'copilot-panel': {
    id: 'copilot-panel',
    label: 'CoPilot Panel',
    description: 'Chat with your AI financial assistant',
    route: '*',
  },
  
  // Legacy navigation (backwards compatibility)
  'nav-dashboard': {
    id: 'nav-dashboard',
    label: 'Dashboard Link',
    description: 'Navigate to your dashboard',
    route: '*',
  },
  'nav-goals': {
    id: 'nav-goals',
    label: 'Goals Link',
    description: 'Navigate to your savings goals',
    route: '*',
  },
  'nav-budget': {
    id: 'nav-budget',
    label: 'Budget Link',
    description: 'Navigate to your budgets',
    route: '*',
  },
};

/**
 * Get element info by ID
 */
export function getElementInfo(elementId: string): ElementInfo | undefined {
  return elementRegistry[elementId];
}

/**
 * Get all elements for a specific route
 */
export function getElementsForRoute(route: string): ElementInfo[] {
  return Object.values(elementRegistry).filter(
    el => el.route === route || el.route === '*'
  );
}

/**
 * Search elements by label or description
 */
export function searchElements(query: string): ElementInfo[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(elementRegistry).filter(
    el => 
      el.label.toLowerCase().includes(lowerQuery) ||
      el.description.toLowerCase().includes(lowerQuery)
  );
}
