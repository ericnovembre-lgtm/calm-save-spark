import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { redisCommand } from "../_shared/upstash-redis.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CacheMetrics {
  function: string;
  hits: number;
  misses: number;
  hitRate: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch cache metrics for all functions
    const functions = [
      'copilot',
      'permissions',
      'ai-coach',
      'dashboard',
      'insights',
      'cashflow',
      'daily-briefing',
    ];

    const metrics: CacheMetrics[] = [];

    for (const fn of functions) {
      const hitsKey = `${fn}:cache:hits`;
      const missesKey = `${fn}:cache:misses`;

      const [hitsResult, missesResult] = await Promise.all([
        redisCommand<string>(['GET', hitsKey]),
        redisCommand<string>(['GET', missesKey]),
      ]);

      const hits = parseInt(hitsResult || '0', 10);
      const misses = parseInt(missesResult || '0', 10);
      const total = hits + misses;
      const hitRate = total > 0 ? Math.round((hits / total) * 100) : 0;

      metrics.push({
        function: fn,
        hits,
        misses,
        hitRate,
      });
    }

    // Calculate totals
    const totalHits = metrics.reduce((sum, m) => sum + m.hits, 0);
    const totalMisses = metrics.reduce((sum, m) => sum + m.misses, 0);
    const totalRequests = totalHits + totalMisses;
    const overallHitRate = totalRequests > 0 ? Math.round((totalHits / totalRequests) * 100) : 0;

    // Get Redis info if available
    const dbSize = await redisCommand<number>(['DBSIZE']);

    console.log(`[cache-metrics] Fetched metrics: ${totalHits} hits, ${totalMisses} misses, ${overallHitRate}% hit rate`);

    return new Response(
      JSON.stringify({
        functions: metrics,
        summary: {
          totalHits,
          totalMisses,
          totalRequests,
          overallHitRate,
          cachedItems: dbSize || 0,
        },
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[cache-metrics] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        functions: [],
        summary: {
          totalHits: 0,
          totalMisses: 0,
          totalRequests: 0,
          overallHitRate: 0,
          cachedItems: 0,
        },
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
