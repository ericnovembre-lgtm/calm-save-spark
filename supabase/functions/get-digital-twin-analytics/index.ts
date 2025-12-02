import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch analytics data
    const { data: analytics, error } = await supabase
      .from('digital_twin_analytics')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Aggregate statistics
    const totalSimulations = analytics?.filter(a => a.event_type === 'simulation_run').length || 0;
    const totalChatQueries = analytics?.filter(a => a.event_type === 'chat_query').length || 0;
    const scenariosSaved = analytics?.filter(a => a.event_type === 'scenario_saved').length || 0;
    const insightsGenerated = analytics?.filter(a => a.event_type === 'insight_generated').length || 0;
    const nlScenariosCreated = analytics?.filter(a => a.event_type === 'scenario_created_nl').length || 0;

    // Model usage distribution
    const modelUsage: Record<string, number> = {};
    analytics?.forEach(a => {
      if (a.model_used) {
        modelUsage[a.model_used] = (modelUsage[a.model_used] || 0) + 1;
      }
    });

    // Average response time
    const responseTimes = analytics?.filter(a => a.response_time_ms).map(a => a.response_time_ms) || [];
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

    // Daily activity
    const dailyActivity: Record<string, number> = {};
    analytics?.forEach(a => {
      const date = new Date(a.created_at).toISOString().split('T')[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    // Life events from scenarios
    const lifeEventsCount: Record<string, number> = {};
    analytics?.forEach(a => {
      if (a.scenario_parameters?.events) {
        (a.scenario_parameters.events as any[]).forEach(e => {
          const label = e.label || e.event?.label || 'Unknown';
          lifeEventsCount[label] = (lifeEventsCount[label] || 0) + 1;
        });
      }
    });

    // Recent insights
    const recentInsights = analytics
      ?.filter(a => a.insight_summary)
      .slice(0, 10)
      .map(a => ({
        summary: a.insight_summary,
        createdAt: a.created_at,
        eventType: a.event_type,
      }));

    // Success probability trends (from outcome_metrics)
    const probabilityTrends = analytics
      ?.filter(a => a.outcome_metrics?.successProbability)
      .map(a => ({
        date: a.created_at,
        probability: a.outcome_metrics.successProbability,
      }))
      .slice(0, 20);

    return new Response(JSON.stringify({
      summary: {
        totalSimulations,
        totalChatQueries,
        scenariosSaved,
        insightsGenerated,
        nlScenariosCreated,
        avgResponseTime,
      },
      modelUsage,
      dailyActivity: Object.entries(dailyActivity)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      lifeEventsCount: Object.entries(lifeEventsCount)
        .map(([event, count]) => ({ event, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      recentInsights,
      probabilityTrends,
      rawData: analytics?.slice(0, 50),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Get Digital Twin Analytics error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
