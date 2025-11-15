import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[Aegis] Starting monitoring cycle...');

    const metrics: PerformanceMetric[] = [];
    const breaches = [];

    // 1. Check Web Vitals from analytics
    const { data: webVitals } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event', 'web_vitals')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (webVitals && webVitals.length > 0) {
      const lcpValues = webVitals
        .filter(e => e.properties?.metric_name === 'LCP')
        .map(e => e.properties.metric_value);
      
      if (lcpValues.length > 0) {
        const avgLCP = lcpValues.reduce((a, b) => a + b, 0) / lcpValues.length;
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
        .filter(e => e.properties?.metric_name === 'INP')
        .map(e => e.properties.metric_value);
      
      if (inpValues.length > 0) {
        const avgINP = inpValues.reduce((a, b) => a + b, 0) / inpValues.length;
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

    // 2. Check Edge Function Error Rates (simulated - would need actual logs)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    // Note: This would query actual edge function logs in production
    // For now, we'll simulate with a low error rate
    const errorRate = 0; // Replace with actual log query
    
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
      const { error: insertError } = await supabase
        .from('performance_metrics')
        .insert(metrics);

      if (insertError) {
        console.error('[Aegis] Error storing metrics:', insertError);
      } else {
        console.log(`[Aegis] Stored ${metrics.length} metrics`);
      }
    }

    // 4. Trigger Hephaestus if breaches detected
    if (breaches.length > 0) {
      console.log(`[Aegis] 🚨 Detected ${breaches.length} SLO breaches, triggering Hephaestus...`);

      const { data: storedBreaches, error: breachError } = await supabase
        .from('slo_breaches')
        .insert(breaches)
        .select();

      if (breachError) {
        console.error('[Aegis] Error storing breaches:', breachError);
      }

      if (storedBreaches) {
        for (const breach of storedBreaches.filter(b => b.severity === 'critical')) {
          try {
            await supabase.functions.invoke('hephaestus-fixer', {
              body: { breach }
            });
          } catch (error) {
            console.error('[Aegis] Error triggering Hephaestus:', error);
          }
        }
      }
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
