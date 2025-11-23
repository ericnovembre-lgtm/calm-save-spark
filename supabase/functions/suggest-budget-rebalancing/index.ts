import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
    if (userError || !user) throw new Error('Unauthorized');

    // Fetch all active budgets
    const { data: budgets } = await supabaseClient
      .from('user_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (!budgets || budgets.length === 0) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch current spending for each budget
    const { data: spending } = await supabaseClient
      .from('budget_spending')
      .select('*')
      .eq('user_id', user.id);

    const spendingMap: Record<string, any> = {};
    spending?.forEach(s => {
      spendingMap[s.budget_id] = s;
    });

    // Fetch recent transactions for velocity analysis
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('transaction_date', startOfMonth)
      .order('transaction_date', { ascending: false })
      .limit(100);

    // Fetch previous transfers for learning
    const { data: previousTransfers } = await supabaseClient
      .from('budget_transfer_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate days remaining
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const dayOfMonth = now.getDate();

    // Calculate velocity (burn rate) for each budget
    const velocityMap: Record<string, number> = {};
    transactions?.forEach(t => {
      const budgetId = t.budget_id;
      if (budgetId) {
        velocityMap[budgetId] = (velocityMap[budgetId] || 0) + Math.abs(t.amount);
      }
    });

    // Convert to daily burn rate
    Object.keys(velocityMap).forEach(budgetId => {
      velocityMap[budgetId] = velocityMap[budgetId] / dayOfMonth;
    });

    // Use Gemini for intelligent rebalancing suggestions
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.warn('LOVABLE_API_KEY not configured, falling back to basic logic');
      // Fallback to basic logic (keep existing code)
      const underutilized: any[] = [];
      const overutilized: any[] = [];

      budgets.forEach(budget => {
        const spend = spendingMap[budget.id];
        const spentAmount = spend?.spent_amount || 0;
        const totalLimit = parseFloat(String(budget.total_limit));
        const remaining = totalLimit - spentAmount;
        const percentUsed = (spentAmount / totalLimit) * 100;

        if (percentUsed < 50 && daysRemaining < 10 && remaining > 50) {
          underutilized.push({ budget, surplus: remaining, percentUsed });
        }

        if (percentUsed > 90 && daysRemaining > 15) {
          const shortage = spentAmount - totalLimit;
          overutilized.push({ budget, shortage: Math.abs(shortage), percentUsed });
        }
      });

      const suggestions: any[] = [];
      for (const over of overutilized) {
        for (const under of underutilized) {
          if (suggestions.length >= 3) break;
          const transferAmount = Math.min(under.surplus * 0.5, over.shortage * 1.2);
          if (transferAmount >= 50) {
            const confidence = Math.min(0.95, (100 - under.percentUsed) / 100 * 0.5 + (over.percentUsed - 90) / 10 * 0.5);
            suggestions.push({
              from: { budgetId: under.budget.id, name: under.budget.name, projectedSurplus: under.surplus },
              to: { budgetId: over.budget.id, name: over.budget.name, projectedShortage: over.shortage },
              amount: Math.round(transferAmount * 100) / 100,
              confidence,
              reasoning: `You've only used ${under.percentUsed.toFixed(0)}% of your ${under.budget.name} budget, but ${over.budget.name} is at ${over.percentUsed.toFixed(0)}%.`,
              urgency: over.percentUsed > 95 ? 'high' : 'medium',
              impact: `Covers ${over.budget.name} shortage and leaves buffer`
            });
          }
        }
      }
      
      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build rich context for Gemini
    const budgetContext = budgets.map(b => {
      const spend = spendingMap[b.id] || {};
      const spentAmount = spend.spent_amount || 0;
      const totalLimit = parseFloat(String(b.total_limit));
      const percentUsed = (spentAmount / totalLimit) * 100;
      const velocity = velocityMap[b.id] || 0;
      const projectedEndOfMonth = spentAmount + (velocity * daysRemaining);

      return `- ${b.name}: $${spentAmount.toFixed(2)} / $${totalLimit.toFixed(2)} (${percentUsed.toFixed(0)}%)
    Burn Rate: $${velocity.toFixed(2)}/day
    Projected End-of-Month: $${projectedEndOfMonth.toFixed(2)}
    Categories: ${Object.keys(b.category_limits || {}).join(', ') || 'General'}`;
    }).join('\n');

    const recentActivity = transactions?.slice(0, 10).map(t => 
      `- $${Math.abs(t.amount).toFixed(2)} on ${t.merchant || 'Unknown'} (${t.category || 'Uncategorized'})`
    ).join('\n') || 'No recent activity';

    const pastTransfers = previousTransfers?.map(t =>
      `- $${t.amount.toFixed(2)} from ${t.from_budget_id} to ${t.to_budget_id}`
    ).join('\n') || 'No past transfers';

    const systemPrompt = `You are a budget rebalancing specialist. Analyze budget data and suggest smart fund transfers.

Current Date: ${now.toLocaleDateString()}
Day of Month: ${dayOfMonth}
Days Remaining: ${daysRemaining}

BUDGETS:
${budgetContext}

RECENT ACTIVITY:
${recentActivity}

PAST TRANSFERS:
${pastTransfers}

Your Task:
1. Identify budgets likely to have surplus at month-end based on burn rate
2. Identify budgets at risk of overspending based on current trajectory
3. Suggest specific, mathematically sound transfers (1-3 suggestions max)
4. Provide confidence scores (0-1) based on data quality and projection accuracy
5. Explain reasoning in user-friendly language
6. Assess urgency (low/medium/high) and impact

Return suggestions sorted by confidence (highest first).`;

    const tools = [
      {
        type: 'function',
        function: {
          name: 'suggest_rebalancing',
          description: 'Recommend budget fund transfers to optimize allocation',
          parameters: {
            type: 'object',
            properties: {
              suggestions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    from: {
                      type: 'object',
                      properties: {
                        budgetId: { type: 'string' },
                        name: { type: 'string' },
                        projectedSurplus: { type: 'number' }
                      }
                    },
                    to: {
                      type: 'object',
                      properties: {
                        budgetId: { type: 'string' },
                        name: { type: 'string' },
                        projectedShortage: { type: 'number' }
                      }
                    },
                    amount: { type: 'number' },
                    confidence: { type: 'number' },
                    reasoning: { type: 'string' },
                    urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
                    impact: { type: 'string' },
                    alternativeActions: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  },
                  required: ['from', 'to', 'amount', 'confidence', 'reasoning', 'urgency', 'impact']
                }
              }
            }
          }
        }
      }
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analyze these budgets and provide rebalancing suggestions.' }
        ],
        tools,
        tool_choice: { type: 'function', function: { name: 'suggest_rebalancing' } }
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI Gateway error:', aiResponse.status);
      throw new Error('Failed to generate AI suggestions');
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { suggestions } = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating rebalancing suggestions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
