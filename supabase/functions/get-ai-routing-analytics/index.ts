import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || '7d';
    
    // Calculate start date based on time range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Fetch analytics data
    const { data: analytics, error } = await supabaseClient
      .from('ai_model_routing_analytics')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Process analytics
    const modelDistribution = processModelDistribution(analytics || []);
    const costSavings = calculateCostSavings(analytics || []);
    const dailyTrends = processDailyTrends(analytics || []);
    const responseTimeByModel = calculateResponseTimes(analytics || []);
    const fallbackStats = calculateFallbackStats(analytics || []);
    const summary = calculateSummary(analytics || []);

    const result = {
      modelDistribution,
      costSavings,
      dailyTrends,
      responseTimeByModel,
      fallbackStats,
      summary
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function processModelDistribution(analytics: any[]) {
  const modelCounts: Record<string, number> = {};
  const modelColors: Record<string, string> = {
    'gemini-flash': 'hsl(var(--chart-3))',
    'claude-sonnet': 'hsl(var(--chart-1))',
    'perplexity': 'hsl(var(--chart-2))',
    'groq-llama': 'hsl(var(--chart-4))',
    'deepseek-reasoner': 'hsl(210, 100%, 50%)' // Deep blue for Deepseek
  };
  const modelNames: Record<string, string> = {
    'gemini-flash': 'Gemini 2.5 Flash',
    'claude-sonnet': 'Claude Sonnet 4.5',
    'perplexity': 'Perplexity Sonar',
    'groq-llama': 'Groq LPU',
    'deepseek-reasoner': 'Deepseek Reasoner'
  };

  analytics.forEach(item => {
    modelCounts[item.model_used] = (modelCounts[item.model_used] || 0) + 1;
  });

  const total = analytics.length;
  return Object.entries(modelCounts).map(([model, count]) => ({
    model,
    modelName: modelNames[model] || model,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    color: modelColors[model] || 'hsl(var(--chart-4))'
  }));
}

function calculateCostSavings(analytics: any[]) {
  const COSTS: Record<string, number> = {
    'gemini-flash': 0.05,
    'claude-sonnet': 0.50,
    'perplexity': 0.30,
    'groq-llama': 0.01,
    'deepseek-reasoner': 0.02
  };

  let totalCost = 0;
  analytics.forEach(item => {
    totalCost += COSTS[item.model_used as keyof typeof COSTS] || 0;
  });

  const costWithoutRouting = analytics.length * COSTS['claude-sonnet'];
  const savings = costWithoutRouting - totalCost;
  const savingsPercentage = costWithoutRouting > 0 ? (savings / costWithoutRouting) * 100 : 0;

  return {
    totalCost: Number(totalCost.toFixed(2)),
    costWithoutRouting: Number(costWithoutRouting.toFixed(2)),
    savings: Number(savings.toFixed(2)),
    savingsPercentage: Number(savingsPercentage.toFixed(1))
  };
}

function processDailyTrends(analytics: any[]) {
  const dailyData: Record<string, { gemini: number; claude: number; perplexity: number; groq: number; deepseek: number }> = {};

  analytics.forEach(item => {
    const date = new Date(item.created_at).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { gemini: 0, claude: 0, perplexity: 0, groq: 0, deepseek: 0 };
    }

    if (item.model_used === 'gemini-flash') dailyData[date].gemini++;
    else if (item.model_used === 'claude-sonnet') dailyData[date].claude++;
    else if (item.model_used === 'perplexity') dailyData[date].perplexity++;
    else if (item.model_used === 'groq-llama') dailyData[date].groq++;
    else if (item.model_used === 'deepseek-reasoner') dailyData[date].deepseek++;
  });

  return Object.entries(dailyData).map(([date, counts]) => ({
    date,
    ...counts,
    total: counts.gemini + counts.claude + counts.perplexity + counts.groq + counts.deepseek
  }));
}

function calculateResponseTimes(analytics: any[]) {
  const modelTimes: Record<string, number[]> = {};

  analytics.forEach(item => {
    if (item.response_time_ms) {
      if (!modelTimes[item.model_used]) {
        modelTimes[item.model_used] = [];
      }
      modelTimes[item.model_used].push(item.response_time_ms);
    }
  });

  return Object.entries(modelTimes).map(([model, times]) => ({
    model,
    avgResponseMs: times.length > 0 
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 0
  }));
}

function calculateFallbackStats(analytics: any[]) {
  const totalFallbacks = analytics.filter(item => item.was_fallback).length;
  const fallbackRate = analytics.length > 0 
    ? (totalFallbacks / analytics.length) * 100 
    : 0;

  const reasonCounts: Record<string, number> = {};
  analytics.forEach(item => {
    if (item.was_fallback && item.fallback_reason) {
      reasonCounts[item.fallback_reason] = (reasonCounts[item.fallback_reason] || 0) + 1;
    }
  });

  const topReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([reason]) => reason);

  return {
    totalFallbacks,
    fallbackRate: Number(fallbackRate.toFixed(1)),
    topReasons
  };
}

function calculateSummary(analytics: any[]) {
  const uniqueConversations = new Set(analytics.map(item => item.conversation_id)).size;
  const avgConfidence = analytics.length > 0
    ? analytics.reduce((sum, item) => sum + (item.confidence_score || 0), 0) / analytics.length
    : 0;

  return {
    totalQueries: analytics.length,
    totalConversations: uniqueConversations,
    avgConfidence: Number(avgConfidence.toFixed(2))
  };
}
