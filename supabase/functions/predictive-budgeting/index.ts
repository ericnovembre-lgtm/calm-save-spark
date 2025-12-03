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
    const { budgetId, period = 'next_month' } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      }
    });

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Check for cached prediction
    const { data: cachedPrediction } = await supabase
      .from('spending_predictions')
      .select('*')
      .eq('user_id', user.id)
      .eq('budget_id', budgetId)
      .eq('prediction_period', period)
      .gte('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cachedPrediction) {
      return new Response(
        JSON.stringify({
          predictedAmount: cachedPrediction.predicted_amount,
          confidence: cachedPrediction.confidence_level,
          factors: cachedPrediction.factors,
          source: 'cache'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get budget and historical data
    const { data: budget } = await supabase
      .from('user_budgets')
      .select('*')
      .eq('id', budgetId)
      .single();

    if (!budget) {
      throw new Error('Budget not found');
    }

    // Get historical spending data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: historicalSpending } = await supabase
      .from('budget_spending')
      .select('*')
      .eq('user_id', user.id)
      .eq('budget_id', budgetId)
      .gte('period_start', sixMonthsAgo.toISOString())
      .order('period_start', { ascending: true });

    // Get budget analytics
    const { data: analytics } = await supabase
      .from('budget_analytics')
      .select('*')
      .eq('user_id', user.id)
      .eq('budget_id', budgetId)
      .order('period_date', { ascending: false })
      .limit(12);

    // Use Lovable AI for prediction
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a financial forecasting expert. Analyze historical spending patterns and predict future spending.

Consider:
- Seasonal trends
- Growth patterns
- Recurring expenses
- Budget limits
- Variance patterns

Return a JSON object with:
- predictedAmount: number
- confidence: "high" | "medium" | "low"
- factors: array of key factors affecting the prediction
- recommendation: string advice`;

    const context = {
      budget: {
        name: budget.budget_name,
        totalLimit: budget.total_limit,
        period: budget.period,
        categoryLimits: budget.category_limits
      },
      historicalSpending: historicalSpending?.map(s => ({
        period: s.period_start,
        amount: s.spent_amount,
        transactionCount: s.transaction_count
      })),
      analytics: analytics?.map(a => ({
        period: a.period_date,
        budgeted: a.budgeted,
        spent: a.spent,
        variance: a.variance
      }))
    };

    const userPrompt = `Predict spending for: ${period}
Context: ${JSON.stringify(context, null, 2)}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Gateway error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const prediction = JSON.parse(aiData.choices[0].message.content);

    // Cache the prediction (valid for 24 hours)
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 24);

    await supabase
      .from('spending_predictions')
      .insert({
        user_id: user.id,
        budget_id: budgetId,
        prediction_period: period,
        predicted_amount: prediction.predictedAmount,
        confidence_level: prediction.confidence,
        factors: prediction.factors,
        valid_until: validUntil.toISOString()
      });

    return new Response(
      JSON.stringify({
        predictedAmount: prediction.predictedAmount,
        confidence: prediction.confidence,
        factors: prediction.factors,
        recommendation: prediction.recommendation,
        source: 'ai'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in predictive-budgeting:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
