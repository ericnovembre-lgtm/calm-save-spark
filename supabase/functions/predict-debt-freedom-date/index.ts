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
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Fetch debts
    const { data: debts } = await supabaseClient
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (!debts || debts.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No active debts found',
          needsData: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Fetch last 90 days of transactions for spending patterns
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('amount, date, category')
      .eq('user_id', user.id)
      .gte('date', ninetyDaysAgo.toISOString())
      .order('date', { ascending: false });

    // Fetch payment history
    const { data: paymentHistory } = await supabaseClient
      .from('debt_payment_history')
      .select('*')
      .eq('user_id', user.id)
      .order('payment_date', { ascending: false })
      .limit(100);

    // Calculate spending metrics
    const avgMonthlySpend = transactions && transactions.length > 0
      ? Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)) / 3
      : 0;

    const spendingAmounts = transactions?.filter(t => t.amount < 0).map(t => Math.abs(t.amount)) || [];
    const avgSpending = spendingAmounts.length > 0 
      ? spendingAmounts.reduce((sum, amt) => sum + amt, 0) / spendingAmounts.length 
      : 0;
    
    const variance = spendingAmounts.length > 0
      ? spendingAmounts.reduce((sum, amt) => sum + Math.pow(amt - avgSpending, 2), 0) / spendingAmounts.length
      : 0;
    const spendingVolatility = avgSpending > 0 ? (Math.sqrt(variance) / avgSpending * 100) : 0;

    // Calculate income patterns
    const incomeTransactions = transactions?.filter(t => t.amount > 0) || [];
    const avgMonthlyIncome = incomeTransactions.length > 0
      ? incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / 3
      : 0;

    // Analyze payment consistency
    const monthsWithPayments = new Set(
      paymentHistory?.map(p => new Date(p.payment_date).toISOString().slice(0, 7)) || []
    ).size;
    
    const monthsWithExtra = paymentHistory?.filter(p => 
      p.amount > (debts.find(d => d.id === p.debt_id)?.minimum_payment || 0)
    ).length || 0;

    const consistencyScore = monthsWithPayments > 0 
      ? Math.round((monthsWithExtra / monthsWithPayments) * 100)
      : 0;

    // Build AI prompt
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a financial forecasting AI that predicts debt freedom dates with high accuracy.

Analyze the following financial data and predict when the user will be completely debt-free:

DEBT PORTFOLIO:
${debts.map(d => `
- ${d.debt_name}: $${d.current_balance} @ ${d.interest_rate}%
  Min Payment: $${d.minimum_payment}
  ${d.actual_payment ? `Actual Payment: $${d.actual_payment}` : ''}
`).join('\n')}

SPENDING BEHAVIOR (Last 90 Days):
- Average Monthly Spending: $${avgMonthlySpend.toFixed(2)}
- Spending Volatility: ${spendingVolatility.toFixed(1)}% (standard deviation)
- Transaction Count: ${transactions?.length || 0}

INCOME PATTERNS:
- Average Monthly Income: $${avgMonthlyIncome.toFixed(2)}
- Income Transactions: ${incomeTransactions.length}

PAYMENT BEHAVIOR:
- Months with Payments: ${monthsWithPayments}
- Months with Extra Payments: ${monthsWithExtra}
- Payment Consistency Score: ${consistencyScore}/100

Based on this holistic view, predict when they'll be debt-free. Consider:
1. Current payment patterns (are they paying extra?)
2. Spending stability (consistent or volatile?)
3. Income reliability
4. Interest accrual on debts

Be realistic but motivating. Factor in both optimistic and conservative scenarios.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Predict my debt freedom date based on the data provided.' }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'predict_debt_freedom',
            description: 'Predict when user will be debt-free based on behavioral analysis',
            parameters: {
              type: 'object',
              properties: {
                predicted_date: { 
                  type: 'string', 
                  description: 'Predicted debt-free date (YYYY-MM-DD)'
                },
                confidence_level: { 
                  type: 'number', 
                  description: 'Confidence in prediction (0-100)'
                },
                months_to_freedom: { 
                  type: 'number', 
                  description: 'Number of months until debt-free'
                },
                key_factors: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Top 3-5 factors influencing timeline'
                },
                acceleration_opportunities: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      action: { type: 'string' },
                      potential_savings: { type: 'number' },
                      time_saved_months: { type: 'number' }
                    }
                  },
                  description: 'Ways to become debt-free faster'
                },
                risks: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Factors that could delay payoff'
                },
                best_case_date: { type: 'string' },
                worst_case_date: { type: 'string' }
              },
              required: ['predicted_date', 'confidence_level', 'months_to_freedom', 'key_factors'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'predict_debt_freedom' } }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few minutes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    if (!aiResponse.choices?.[0]?.message?.tool_calls?.[0]) {
      throw new Error('Invalid AI response format');
    }

    const prediction = JSON.parse(aiResponse.choices[0].message.tool_calls[0].function.arguments);

    return new Response(
      JSON.stringify({ 
        success: true,
        prediction,
        dataQuality: {
          hasTransactions: (transactions?.length || 0) > 30,
          hasPaymentHistory: (paymentHistory?.length || 0) > 3,
          monthsOfData: Math.max(monthsWithPayments, 1)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Debt freedom prediction error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
