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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { category, months = 3 } = await req.json();

    console.log('Generating spending forecast for:', category, 'months:', months);

    // Fetch historical spending data
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, date, category')
      .eq('user_id', user.id)
      .eq('category', category)
      .gte('date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: true });

    if (!transactions || transactions.length < 3) {
      throw new Error('Insufficient historical data for forecasting');
    }

    // Use Lovable AI for intelligent forecasting
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const historicalData = transactions.map(t => ({
      date: t.date,
      amount: parseFloat(t.amount.toString())
    }));

    const prompt = `You are a financial forecasting AI. Based on the following historical spending data, predict spending for the next ${months} months.

Historical data (date, amount):
${historicalData.map(d => `${d.date}: $${d.amount}`).join('\n')}

Consider:
- Seasonal patterns
- Trend analysis
- Recent changes in spending behavior

Provide monthly predictions with confidence scores (0-1).`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a financial forecasting expert. Analyze spending patterns and provide accurate predictions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'provide_forecast',
            description: 'Return monthly spending forecast predictions',
            parameters: {
              type: 'object',
              properties: {
                forecasts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      month: { type: 'integer' },
                      predicted_amount: { type: 'number' },
                      confidence_score: { type: 'number' }
                    },
                    required: ['month', 'predicted_amount', 'confidence_score']
                  }
                }
              },
              required: ['forecasts']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'provide_forecast' } }
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices[0].message.tool_calls[0];
    const forecasts = JSON.parse(toolCall.function.arguments).forecasts;

    // Store forecasts in database
    const forecastRecords = forecasts.map((f: any) => ({
      user_id: user.id,
      category,
      forecast_date: new Date(Date.now() + f.month * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      predicted_amount: f.predicted_amount,
      confidence_score: f.confidence_score
    }));

    await supabase.from('spending_forecasts').insert(forecastRecords as any);

    return new Response(
      JSON.stringify({ forecasts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating forecast:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});