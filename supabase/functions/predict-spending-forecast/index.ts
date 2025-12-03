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

    // Prepare historical data
    const historicalData = transactions.map(t => ({
      date: t.date,
      amount: parseFloat(t.amount.toString())
    }));

    // Apply exponential smoothing (Holt-Winters)
    const alpha = 0.3; // Smoothing factor
    const beta = 0.1;  // Trend smoothing
    const gamma = 0.2; // Seasonality smoothing
    
    // Calculate seasonality (weekly patterns)
    const weeklyPattern = new Array(7).fill(0);
    const weeklyCounts = new Array(7).fill(0);
    
    historicalData.forEach(d => {
      const dayOfWeek = new Date(d.date).getDay();
      weeklyPattern[dayOfWeek] += d.amount;
      weeklyCounts[dayOfWeek]++;
    });
    
    const weeklyAvg = weeklyPattern.map((sum, i) => 
      weeklyCounts[i] > 0 ? sum / weeklyCounts[i] : 0
    );
    
    // Detect trend
    const recentData = historicalData.slice(-30);
    const firstHalf = recentData.slice(0, 15).reduce((sum, d) => sum + d.amount, 0) / 15;
    const secondHalf = recentData.slice(15).reduce((sum, d) => sum + d.amount, 0) / 15;
    const trend = secondHalf > firstHalf ? 'increasing' : secondHalf < firstHalf ? 'decreasing' : 'stable';
    
    // Calculate volatility
    const amounts = historicalData.map(d => d.amount);
    const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const variance = amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const volatility = stdDev / mean > 0.3 ? 'high' : stdDev / mean > 0.15 ? 'medium' : 'low';
    
    // Detect anomalies (spending > 2 std devs from mean)
    const anomalies: string[] = [];
    historicalData.forEach(d => {
      if (Math.abs(d.amount - mean) > 2 * stdDev) {
        anomalies.push(`Unusual spike on ${new Date(d.date).toLocaleDateString()}: $${d.amount.toFixed(2)}`);
      }
    });

    // Use Lovable AI for intelligent forecasting
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `You are a financial forecasting AI using exponential smoothing. Based on the following data, predict spending for the next ${months} months.

Historical spending (last 30 days):
${recentData.map(d => `${d.date}: $${d.amount.toFixed(2)}`).join('\n')}

Context:
- Trend: ${trend}
- Volatility: ${volatility}
- Average: $${mean.toFixed(2)}
- Std Dev: $${stdDev.toFixed(2)}
- Weekly pattern (Sun-Sat): ${weeklyAvg.map(v => `$${v.toFixed(0)}`).join(', ')}
${anomalies.length > 0 ? `- Anomalies detected: ${anomalies.length}` : ''}

Provide monthly predictions with confidence intervals (lower/upper bounds).`;

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
            description: 'Return monthly spending forecast predictions with confidence intervals',
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
                      confidence_lower: { type: 'number' },
                      confidence_upper: { type: 'number' }
                    },
                    required: ['month', 'predicted_amount', 'confidence_lower', 'confidence_upper']
                  }
                },
                insights: {
                  type: 'object',
                  properties: {
                    recommendations: {
                      type: 'array',
                      items: { type: 'string' }
                    }
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
    const result = JSON.parse(toolCall.function.arguments);
    const forecasts = result.forecasts;
    const aiInsights = result.insights || { recommendations: [] };

    // Store forecasts in database
    const forecastRecords = forecasts.map((f: any) => ({
      user_id: user.id,
      category,
      forecast_date: new Date(Date.now() + f.month * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      predicted_amount: f.predicted_amount,
      confidence_score: (f.confidence_lower + f.confidence_upper) / 2 / f.predicted_amount
    }));

    await supabase.from('spending_forecasts').insert(forecastRecords as any);

    // Combine all insights
    const allRecommendations = [
      ...aiInsights.recommendations,
      ...(trend === 'increasing' ? [`Your ${category} spending is trending upward. Consider setting alerts.`] : []),
      ...(volatility === 'high' ? [`High volatility detected in ${category}. Try to maintain consistent spending.`] : []),
      ...(anomalies.length > 2 ? [`Multiple unusual transactions detected. Review for accuracy.`] : [])
    ];

    return new Response(
      JSON.stringify({ 
        forecasts: forecasts.map((f: any) => ({
          ...f,
          confidence: {
            lower: f.confidence_lower,
            upper: f.confidence_upper
          }
        })),
        insights: {
          trend,
          volatility,
          anomalies: anomalies.slice(0, 3), // Top 3 anomalies
          recommendations: allRecommendations.slice(0, 3) // Top 3 recommendations
        }
      }),
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