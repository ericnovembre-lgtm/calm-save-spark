import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PerformanceMetric {
  metric_type: string;
  metric_name: string;
  metric_value: number;
  threshold_value: number;
  status: 'healthy' | 'warning' | 'critical';
  metadata: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const supabaseHeaders = {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    };

    console.log('[Aegis] Starting monitoring cycle...');

    const metrics: PerformanceMetric[] = [];
    const breaches = [];

    // 1. Check Web Vitals from analytics
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const vitalsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/analytics_events?event=eq.web_vitals&created_at=gte.${fiveMinutesAgo}&order=created_at.desc&limit=100`,
      { headers: supabaseHeaders }
    );

    if (vitalsResponse.ok) {
      const webVitals = await vitalsResponse.json();

      if (webVitals && webVitals.length > 0) {
        const lcpValues = webVitals
          .filter((e: any) => e.properties?.metric_name === 'LCP')
          .map((e: any) => e.properties.metric_value);
        
        if (lcpValues.length > 0) {
          const avgLCP = lcpValues.reduce((a: number, b: number) => a + b, 0) / lcpValues.length;
          const status = avgLCP > 2500 ? 'critical' : avgLCP > 2000 ? 'warning' : 'healthy';
          
          metrics.push({
            metric_type: 'web_vitals',
            metric_name: 'LCP',
            metric_value: avgLCP,
            threshold_value: 2500,
            status,
            metadata: { sample_size: lcpValues.length }
          });

          if (status !== 'healthy') {
            breaches.push({
              breach_type: 'performance',
              severity: status === 'critical' ? 'critical' : 'warning',
              metric_name: 'LCP',
              current_value: avgLCP,
              threshold_value: 2500,
              metadata: { sample_size: lcpValues.length }
            });
          }
        }

        const inpValues = webVitals
          .filter((e: any) => e.properties?.metric_name === 'INP')
          .map((e: any) => e.properties.metric_value);
        
        if (inpValues.length > 0) {
          const avgINP = inpValues.reduce((a: number, b: number) => a + b, 0) / inpValues.length;
          const status = avgINP > 200 ? 'critical' : avgINP > 100 ? 'warning' : 'healthy';
          
          metrics.push({
            metric_type: 'web_vitals',
            metric_name: 'INP',
            metric_value: avgINP,
            threshold_value: 200,
            status,
            metadata: { sample_size: inpValues.length }
          });

          if (status !== 'healthy') {
            breaches.push({
              breach_type: 'performance',
              severity: status === 'critical' ? 'critical' : 'warning',
              metric_name: 'INP',
              current_value: avgINP,
              threshold_value: 200,
              metadata: { sample_size: inpValues.length }
            });
          }
        }
      }
    }

    // 2. Check Edge Function Error Rates
    const errorRate = 0; // Would query actual logs in production
    
    metrics.push({
      metric_type: 'edge_function',
      metric_name: 'error_rate',
      metric_value: errorRate,
      threshold_value: 5,
      status: errorRate > 5 ? 'critical' : errorRate > 2 ? 'warning' : 'healthy',
      metadata: { total_requests: 0, errors: 0 }
    });

    // 3. Store metrics
    if (metrics.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/performance_metrics`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(metrics)
      });
      console.log(`[Aegis] Stored ${metrics.length} metrics`);
    }

    // 4. Handle breaches
    if (breaches.length > 0) {
      console.log(`[Aegis] 🚨 Detected ${breaches.length} SLO breaches`);
      
      await fetch(`${SUPABASE_URL}/rest/v1/slo_breaches`, {
        method: 'POST',
        headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify(breaches)
      });
    } else {
      console.log('[Aegis] ✅ All systems healthy');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        metrics_collected: metrics.length,
        breaches_detected: breaches.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Aegis] Monitor error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
