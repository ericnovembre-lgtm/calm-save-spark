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

    console.log('Calculating financial health for user:', user.id);

    // Check cache first (1 hour TTL)
    const cacheKey = `financial_health:${user.id}`;
    const { data: cachedData } = await supabaseClient.rpc('get_cached_response', {
      p_cache_key: cacheKey
    });

    if (cachedData) {
      console.log('Returning cached financial health score');
      return new Response(
        JSON.stringify(cachedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' } }
      );
    }

    // Use database function for calculation (optimized with indexes)
    const { data: healthData, error: calcError } = await supabaseClient.rpc(
      'calculate_financial_health_score',
      { p_user_id: user.id }
    );

    if (calcError) {
      console.error('Calculation error:', calcError);
      throw calcError;
    }
    
    if (!healthData || healthData.length === 0) {
      throw new Error('Failed to calculate financial health score');
    }

    const result = healthData[0];
    const overallScore = result.overall_score;
    const creditComponent = result.credit_component;
    const debtComponent = result.debt_component;
    const savingsComponent = result.savings_component;
    const goalsComponent = result.goals_component;
    const investmentComponent = result.investment_component;
    const emergencyFundComponent = result.emergency_fund_component;
    const recommendations = result.recommendations || [];

    console.log('Calculated score:', overallScore);

    // Store health score in database
    await supabaseClient
      .from('financial_health_scores')
      .insert({
        user_id: user.id,
        overall_score: overallScore,
        credit_score_component: creditComponent,
        debt_component: debtComponent,
        savings_component: savingsComponent,
        goals_component: goalsComponent,
        investment_component: investmentComponent,
        emergency_fund_component: emergencyFundComponent,
        recommendations: recommendations,
      });

    // Save to history for tracking trends
    const { error: historyError } = await supabaseClient
      .from('financial_health_history')
      .insert({
        user_id: user.id,
        score: overallScore,
        components: {
          credit: creditComponent,
          debt: debtComponent,
          savings: savingsComponent,
          goals: goalsComponent,
          investment: investmentComponent,
          emergency_fund: emergencyFundComponent,
        },
        recommendations: recommendations,
      });

    if (historyError) {
      console.error('Error saving health history:', historyError);
    }

    const responseData = {
      score: overallScore,
      components: {
        credit: creditComponent,
        debt: debtComponent,
        savings: savingsComponent,
        goals: goalsComponent,
        investment: investmentComponent,
        emergencyFund: emergencyFundComponent,
      },
      recommendations,
    };

    // Cache the response (1 hour TTL)
    await supabaseClient.rpc('set_cached_response', {
      p_cache_key: cacheKey,
      p_cache_type: 'financial_health',
      p_user_id: user.id,
      p_response_data: responseData,
      p_ttl_seconds: 3600 // 1 hour
    });

    console.log('Financial health calculation complete and cached');

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Financial Health Calculation Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
