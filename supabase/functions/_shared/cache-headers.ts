/**
 * Phase 6: Shared Cache Headers Utility
 * 
 * Provides consistent SWR-compatible caching headers
 * for edge functions to enable CDN caching and client-side SWR
 */

export interface CacheHeaderOptions {
  cacheHit: boolean;
  cacheAge?: number;
  ttl: number;
  staleWhileRevalidate?: number;
  vary?: string[];
}

/**
 * Generate SWR-compatible cache headers
 */
export function getCacheHeaders(options: CacheHeaderOptions): Record<string, string> {
  const {
    cacheHit,
    cacheAge = 0,
    ttl,
    staleWhileRevalidate = ttl,
    vary = ['Authorization'],
  } = options;

  return {
    'Cache-Control': `public, max-age=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`,
    'X-Cache': cacheHit ? 'HIT' : 'MISS',
    'X-Cache-Age': cacheAge.toString(),
    'X-Cache-TTL': ttl.toString(),
    'Vary': vary.join(', '),
  };
}

/**
 * Predefined TTLs based on data volatility
 */
export const CACHE_TTLS = {
  // High volatility - short cache
  transactions: 60,        // 1 minute
  balances: 60,            // 1 minute
  
  // Medium volatility
  budgets: 180,            // 3 minutes
  goals: 300,              // 5 minutes
  dashboard: 300,          // 5 minutes
  
  // Low volatility - longer cache
  investments: 600,        // 10 minutes
  healthScore: 900,        // 15 minutes
  creditScore: 3600,       // 1 hour
  
  // Static/rare changes
  profile: 1800,           // 30 minutes
  settings: 3600,          // 1 hour
} as const;

/**
 * Get cache headers for dashboard data
 */
export function getDashboardCacheHeaders(cacheHit: boolean, cacheAge?: number) {
  return getCacheHeaders({
    cacheHit,
    cacheAge,
    ttl: CACHE_TTLS.dashboard,
    staleWhileRevalidate: CACHE_TTLS.dashboard * 2,
  });
}

/**
 * Merge cache headers with CORS headers
 */
export function mergeWithCors(
  corsHeaders: Record<string, string>,
  cacheHeaders: Record<string, string>
): Record<string, string> {
  return {
    ...corsHeaders,
    'Content-Type': 'application/json',
    ...cacheHeaders,
  };
}
