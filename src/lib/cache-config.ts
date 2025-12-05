/**
 * Cache Configuration with Volatility-Based TTLs
 * Phase 6: Backend Optimization
 * 
 * TTLs based on how frequently data changes
 */

export const CACHE_TTL = {
  // High volatility (changes frequently)
  balance: 1 * 60 * 1000,           // 1 minute
  transactions: 5 * 60 * 1000,       // 5 minutes
  notifications: 2 * 60 * 1000,      // 2 minutes
  
  // Medium volatility
  goals: 60 * 60 * 1000,             // 1 hour
  pots: 60 * 60 * 1000,              // 1 hour
  budgets: 30 * 60 * 1000,           // 30 minutes
  debts: 60 * 60 * 1000,             // 1 hour
  investments: 15 * 60 * 1000,       // 15 minutes
  
  // Low volatility (rarely changes)
  profile: 24 * 60 * 60 * 1000,      // 24 hours
  preferences: 24 * 60 * 60 * 1000,  // 24 hours
  achievements: 60 * 60 * 1000,      // 1 hour
  
  // AI responses
  dashboardLayout: 10 * 60 * 1000,   // 10 minutes
  coachContext: 30 * 60 * 1000,      // 30 minutes
  aiInsights: 60 * 60 * 1000,        // 1 hour
  digitalTwin: 24 * 60 * 60 * 1000,  // 24 hours
  
  // Financial calculations
  financialHealth: 60 * 60 * 1000,   // 1 hour
  netWorth: 60 * 60 * 1000,          // 1 hour
  projections: 6 * 60 * 60 * 1000,   // 6 hours
} as const;

export type CacheKey = keyof typeof CACHE_TTL;

/**
 * Stale time configuration (how long before data is considered stale)
 * Data can still be shown but will trigger background revalidation
 */
export const STALE_TIME = {
  balance: 30 * 1000,                // 30 seconds
  transactions: 2 * 60 * 1000,       // 2 minutes
  notifications: 1 * 60 * 1000,      // 1 minute
  goals: 30 * 60 * 1000,             // 30 minutes
  pots: 30 * 60 * 1000,              // 30 minutes
  budgets: 15 * 60 * 1000,           // 15 minutes
  debts: 30 * 60 * 1000,             // 30 minutes
  investments: 5 * 60 * 1000,        // 5 minutes
  profile: 12 * 60 * 60 * 1000,      // 12 hours
  preferences: 12 * 60 * 60 * 1000,  // 12 hours
  achievements: 30 * 60 * 1000,      // 30 minutes
  dashboardLayout: 5 * 60 * 1000,    // 5 minutes
  coachContext: 15 * 60 * 1000,      // 15 minutes
  aiInsights: 30 * 60 * 1000,        // 30 minutes
  digitalTwin: 12 * 60 * 60 * 1000,  // 12 hours
  financialHealth: 30 * 60 * 1000,   // 30 minutes
  netWorth: 30 * 60 * 1000,          // 30 minutes
  projections: 3 * 60 * 60 * 1000,   // 3 hours
} as const;

/**
 * Revalidation intervals (how often to check for updates in background)
 */
export const REVALIDATE_INTERVAL = {
  balance: 60 * 1000,                // 1 minute
  transactions: 5 * 60 * 1000,       // 5 minutes
  notifications: 30 * 1000,          // 30 seconds
  goals: 5 * 60 * 1000,              // 5 minutes
  pots: 5 * 60 * 1000,               // 5 minutes
  budgets: 5 * 60 * 1000,            // 5 minutes
  debts: 10 * 60 * 1000,             // 10 minutes
  investments: 5 * 60 * 1000,        // 5 minutes
  profile: false,                    // No auto-revalidation
  preferences: false,                // No auto-revalidation
  achievements: 10 * 60 * 1000,      // 10 minutes
  dashboardLayout: false,            // No auto-revalidation
  coachContext: false,               // No auto-revalidation
  aiInsights: 15 * 60 * 1000,        // 15 minutes
  digitalTwin: false,                // No auto-revalidation
  financialHealth: 10 * 60 * 1000,   // 10 minutes
  netWorth: 10 * 60 * 1000,          // 10 minutes
  projections: false,                // No auto-revalidation
} as const;

/**
 * Get cache configuration for a specific key
 */
export function getCacheConfig(key: CacheKey) {
  return {
    ttl: CACHE_TTL[key],
    staleTime: STALE_TIME[key],
    revalidateInterval: REVALIDATE_INTERVAL[key],
  };
}

/**
 * Check if cached data is stale
 */
export function isStale(key: CacheKey, cachedAt: number): boolean {
  const staleTime = STALE_TIME[key];
  return Date.now() - cachedAt > staleTime;
}

/**
 * Check if cached data is expired (should not be used at all)
 */
export function isExpired(key: CacheKey, cachedAt: number): boolean {
  const ttl = CACHE_TTL[key];
  return Date.now() - cachedAt > ttl;
}
