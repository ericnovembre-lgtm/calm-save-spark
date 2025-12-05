/**
 * Query Invalidation Rules
 * Phase 6: Backend Optimization
 * 
 * Maps mutations to cache keys that should be invalidated
 */

export type MutationType = 
  | 'goal:create'
  | 'goal:update'
  | 'goal:delete'
  | 'goal:contribute'
  | 'pot:create'
  | 'pot:update'
  | 'pot:delete'
  | 'pot:transfer'
  | 'budget:create'
  | 'budget:update'
  | 'budget:delete'
  | 'transaction:create'
  | 'transaction:update'
  | 'transaction:delete'
  | 'debt:create'
  | 'debt:update'
  | 'debt:delete'
  | 'debt:payment'
  | 'profile:update'
  | 'preferences:update'
  | 'account:connect'
  | 'account:disconnect'
  | 'investment:create'
  | 'investment:update'
  | 'investment:sell';

/**
 * Maps mutation types to query keys that should be invalidated
 */
export const INVALIDATION_RULES: Record<MutationType, string[]> = {
  // Goal mutations
  'goal:create': ['goals', 'dashboard', 'financial-health', 'ai-insights'],
  'goal:update': ['goals', 'dashboard', 'financial-health'],
  'goal:delete': ['goals', 'dashboard', 'financial-health', 'ai-insights'],
  'goal:contribute': ['goals', 'dashboard', 'balance', 'transactions', 'financial-health', 'net-worth'],
  
  // Pot mutations
  'pot:create': ['pots', 'dashboard', 'balance'],
  'pot:update': ['pots', 'dashboard'],
  'pot:delete': ['pots', 'dashboard', 'balance'],
  'pot:transfer': ['pots', 'balance', 'dashboard', 'transactions', 'net-worth'],
  
  // Budget mutations
  'budget:create': ['budgets', 'dashboard', 'spending-breakdown'],
  'budget:update': ['budgets', 'dashboard', 'spending-breakdown'],
  'budget:delete': ['budgets', 'dashboard', 'spending-breakdown'],
  
  // Transaction mutations
  'transaction:create': ['transactions', 'balance', 'budgets', 'dashboard', 'spending-breakdown', 'net-worth'],
  'transaction:update': ['transactions', 'budgets', 'spending-breakdown'],
  'transaction:delete': ['transactions', 'balance', 'budgets', 'dashboard', 'spending-breakdown'],
  
  // Debt mutations
  'debt:create': ['debts', 'dashboard', 'financial-health', 'net-worth'],
  'debt:update': ['debts', 'dashboard', 'financial-health'],
  'debt:delete': ['debts', 'dashboard', 'financial-health', 'net-worth'],
  'debt:payment': ['debts', 'balance', 'transactions', 'dashboard', 'financial-health', 'net-worth'],
  
  // Profile mutations
  'profile:update': ['profile', 'dashboard'],
  'preferences:update': ['preferences'],
  
  // Account mutations
  'account:connect': ['accounts', 'balance', 'transactions', 'dashboard', 'net-worth'],
  'account:disconnect': ['accounts', 'balance', 'transactions', 'dashboard', 'net-worth'],
  
  // Investment mutations
  'investment:create': ['investments', 'portfolio', 'dashboard', 'net-worth'],
  'investment:update': ['investments', 'portfolio', 'dashboard'],
  'investment:sell': ['investments', 'portfolio', 'balance', 'transactions', 'dashboard', 'net-worth'],
};

/**
 * Get query keys to invalidate for a given mutation
 */
export function getInvalidationKeys(mutation: MutationType): string[] {
  return INVALIDATION_RULES[mutation] || [];
}

/**
 * Check if a query key should be invalidated by a mutation
 */
export function shouldInvalidate(mutation: MutationType, queryKey: string): boolean {
  const keys = INVALIDATION_RULES[mutation];
  return keys?.includes(queryKey) || false;
}
