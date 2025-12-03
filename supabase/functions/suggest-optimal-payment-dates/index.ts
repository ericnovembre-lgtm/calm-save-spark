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
        JSON.stringify({ error: 'No active debts found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Fetch income transactions (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('amount, date, description, category')
      .eq('user_id', user.id)
      .gte('date', ninetyDaysAgo.toISOString())
      .order('date', { ascending: false });

    // Detect income patterns
    const incomeTransactions = transactions?.filter(t => t.amount > 0 && t.amount > 500) || [];
    const incomePattern = detectIncomePattern(incomeTransactions);

    // Fetch recurring bills
    const { data: recurringPatterns } = await supabaseClient
      .from('recurring_patterns')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Analyze cash flow by day of month
    const cashFlowByDay = analyzeCashFlowByDay(transactions || []);

    // Build AI prompt
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a cash flow optimization specialist helping users schedule debt payments optimally.

Analyze this user's financial timing and suggest the best payment schedule:

INCOME PATTERNS:
- Pay Frequency: ${incomePattern.frequency}
- Typical Pay Dates: ${incomePattern.payDates.join(', ')} (day of month)
- Average Income: $${incomePattern.avgAmount.toFixed(2)}
- Income Stability: ${incomePattern.stability}

DEBT OBLIGATIONS:
${debts.map(d => `
- ${d.debt_name}: $${d.minimum_payment} payment
  ${d.due_date ? `Current Due Date: ${d.due_date}` : 'Due date not set'}
`).join('\n')}

OTHER RECURRING BILLS:
${recurringPatterns?.map(p => `
- ${p.merchant_name}: $${p.average_amount.toFixed(2)} typically on day ${p.predicted_next_date ? new Date(p.predicted_next_date).getDate() : 'unknown'}
`).join('\n') || 'No recurring bills detected'}

CASH FLOW PATTERNS:
- Typical Low Balance Days: ${cashFlowByDay.lowDays.join(', ')}
- Typical High Balance Days: ${cashFlowByDay.highDays.join(', ')}

GOALS:
1. Prevent late fees and missed payments
2. Optimize float without risking overdrafts
3. Build consistent payment habits
4. Align payments with income timing
5. Leave adequate buffer for unexpected expenses

Suggest optimal payment dates for each debt considering cash flow patterns.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Suggest optimal payment dates for my debts based on my cash flow.' }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'suggest_payment_schedule',
            description: 'Suggest optimal debt payment dates based on cash flow analysis',
            parameters: {
              type: 'object',
              properties: {
                payment_schedule: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      debt_id: { type: 'string' },
                      debt_name: { type: 'string' },
                      current_due_date: { type: 'number' },
                      suggested_payment_date: { type: 'number' },
                      reasoning: { type: 'string' },
                      risk_level: { 
                        type: 'string', 
                        enum: ['low', 'medium', 'high']
                      }
                    }
                  }
                },
                overall_strategy: { 
                  type: 'string', 
                  description: 'High-level payment timing strategy'
                },
                cash_flow_warnings: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Potential cash flow issues'
                },
                automation_recommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      debt_name: { type: 'string' },
                      recommended_automation: { type: 'string' }
                    }
                  }
                }
              },
              required: ['payment_schedule', 'overall_strategy'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_payment_schedule' } }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    if (!aiResponse.choices?.[0]?.message?.tool_calls?.[0]) {
      throw new Error('Invalid AI response format');
    }

    const schedule = JSON.parse(aiResponse.choices[0].message.tool_calls[0].function.arguments);

    return new Response(
      JSON.stringify({ 
        success: true,
        schedule,
        incomePattern,
        cashFlowInsights: cashFlowByDay
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment schedule error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions
function detectIncomePattern(incomeTransactions: any[]) {
  if (incomeTransactions.length === 0) {
    return {
      frequency: 'unknown',
      payDates: [],
      avgAmount: 0,
      stability: 'insufficient_data'
    };
  }

  const amounts = incomeTransactions.map(t => t.amount);
  const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
  
  const dates = incomeTransactions.map(t => new Date(t.date).getDate());
  const uniqueDates = [...new Set(dates)];
  
  // Detect frequency based on transaction spacing
  const daysBetween = [];
  for (let i = 1; i < incomeTransactions.length; i++) {
    const diff = Math.abs(
      new Date(incomeTransactions[i-1].date).getTime() - 
      new Date(incomeTransactions[i].date).getTime()
    ) / (1000 * 60 * 60 * 24);
    daysBetween.push(diff);
  }
  
  const avgDays = daysBetween.length > 0 
    ? daysBetween.reduce((sum, d) => sum + d, 0) / daysBetween.length 
    : 30;
  
  let frequency = 'monthly';
  if (avgDays < 10) frequency = 'weekly';
  else if (avgDays < 18) frequency = 'bi-weekly';
  else if (avgDays < 25) frequency = 'semi-monthly';
  
  // Calculate stability (coefficient of variation)
  const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) / amounts.length;
  const cv = Math.sqrt(variance) / avgAmount;
  const stability = cv < 0.15 ? 'stable' : cv < 0.30 ? 'variable' : 'irregular';

  return {
    frequency,
    payDates: uniqueDates.slice(0, 4),
    avgAmount,
    stability
  };
}

function analyzeCashFlowByDay(transactions: any[]) {
  const balanceByDay: { [key: number]: number[] } = {};
  
  // Group by day of month
  transactions.forEach(t => {
    const day = new Date(t.date).getDate();
    if (!balanceByDay[day]) balanceByDay[day] = [];
    balanceByDay[day].push(t.amount);
  });
  
  // Calculate average for each day
  const avgByDay: { [key: number]: number } = {};
  Object.keys(balanceByDay).forEach(day => {
    const dayNum = parseInt(day);
    avgByDay[dayNum] = balanceByDay[dayNum].reduce((sum, amt) => sum + amt, 0) / balanceByDay[dayNum].length;
  });
  
  // Find high and low days
  const sortedDays = Object.entries(avgByDay).sort((a, b) => a[1] - b[1]);
  const lowDays = sortedDays.slice(0, 5).map(([day]) => parseInt(day));
  const highDays = sortedDays.slice(-5).map(([day]) => parseInt(day));
  
  return { lowDays, highDays };
}
