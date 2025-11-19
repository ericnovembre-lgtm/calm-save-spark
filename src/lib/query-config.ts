/**
 * Optimized React Query Configuration
 * Phase 1: Query & Data Layer Optimization
 * 
 * Reduces unnecessary refetches and improves cache efficiency
 */

export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
      gcTime: 10 * 60 * 1000, // 10 minutes - renamed from cacheTime in v5
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnReconnect: 'always' as const, // Refetch when coming back online
      retry: 1, // Only retry once on failure
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
};

/**
 * Query key factory for consistent cache management
 */
export const queryKeys = {
  // User data
  profile: (userId?: string) => ['profile', userId] as const,
  preferences: (userId?: string) => ['preferences', userId] as const,
  
  // Financial entities
  goals: (userId?: string) => ['goals', userId] as const,
  goal: (id: string) => ['goal', id] as const,
  pots: (userId?: string) => ['pots', userId] as const,
  pot: (id: string) => ['pot', id] as const,
  debts: (userId?: string) => ['debts', userId] as const,
  debt: (id: string) => ['debt', id] as const,
  budgets: (userId?: string) => ['budgets', userId] as const,
  budget: (id: string) => ['budget', id] as const,
  
  // Automations
  automations: (userId?: string) => ['automations', userId] as const,
  automation: (id: string) => ['automation', id] as const,
  
  // Transactions
  transactions: (filters?: Record<string, any>) => ['transactions', filters] as const,
  
  // Analytics
  dashboard: (userId?: string) => ['dashboard', userId] as const,
  financialHealth: (userId?: string) => ['financial-health', userId] as const,
  
  // Connected accounts
  accounts: (userId?: string) => ['accounts', userId] as const,
  
  // Achievements
  achievements: (userId?: string) => ['achievements', userId] as const,
} as const;
