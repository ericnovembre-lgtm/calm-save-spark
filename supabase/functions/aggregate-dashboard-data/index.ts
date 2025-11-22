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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Not authenticated');
    }
    
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check cache first (5 min TTL)
    const cacheKey = `dashboard_data:${user.id}`;
    const { data: cachedData } = await supabaseClient.rpc('get_cached_response', {
      p_cache_key: cacheKey
    });

    if (cachedData) {
      return new Response(
        JSON.stringify(cachedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' } }
      );
    }

    // Fetch all data in parallel
    const [
      goalsResult,
      potsResult,
      debtsResult,
      transactionsResult,
      budgetsResult,
      healthResult,
      healthHistoryResult,
      investmentsResult
    ] = await Promise.allSettled([
      supabaseClient.from('goals').select('*').eq('user_id', user.id),
      supabaseClient.from('pots').select('*').eq('user_id', user.id),
      supabaseClient.from('debts').select('*').eq('user_id', user.id),
      supabaseClient.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabaseClient.from('user_budgets').select('*, budget_spending(*)').eq('user_id', user.id),
      supabaseClient.rpc('calculate_financial_health_score', { p_user_id: user.id }),
      supabaseClient.from('financial_health_history').select('*').eq('user_id', user.id).order('calculated_at', { ascending: true }).limit(180),
      supabaseClient.from('investment_accounts').select('*').eq('user_id', user.id)
    ]);

    const aggregatedData = {
      goals: goalsResult.status === 'fulfilled' ? goalsResult.value.data : [],
      pots: potsResult.status === 'fulfilled' ? potsResult.value.data : [],
      debts: debtsResult.status === 'fulfilled' ? debtsResult.value.data : [],
      transactions: transactionsResult.status === 'fulfilled' ? transactionsResult.value.data : [],
      budgets: budgetsResult.status === 'fulfilled' ? budgetsResult.value.data : [],
      financialHealth: healthResult.status === 'fulfilled' && healthResult.value.data?.[0] 
        ? {
            score: healthResult.value.data[0].overall_score,
            components: {
              credit: healthResult.value.data[0].credit_component,
              debt: healthResult.value.data[0].debt_component,
              savings: healthResult.value.data[0].savings_component,
              goals: healthResult.value.data[0].goals_component,
              investment: healthResult.value.data[0].investment_component,
              emergencyFund: healthResult.value.data[0].emergency_fund_component,
            },
            recommendations: healthResult.value.data[0].recommendations || [],
          }
        : null,
      healthHistory: healthHistoryResult.status === 'fulfilled' ? healthHistoryResult.value.data : [],
      investments: investmentsResult.status === 'fulfilled' ? investmentsResult.value.data : [],
      timestamp: new Date().toISOString(),
    };

    // Cache for 5 minutes
    await supabaseClient.rpc('set_cached_response', {
      p_cache_key: cacheKey,
      p_cache_type: 'dashboard_aggregation',
      p_user_id: user.id,
      p_response_data: aggregatedData,
      p_ttl_seconds: 300
    });

    return new Response(
      JSON.stringify(aggregatedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Dashboard Aggregation Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
