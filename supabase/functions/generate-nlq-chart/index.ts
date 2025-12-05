import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Query classification keywords
const AFFORDABILITY_KEYWORDS = ['afford', 'can i buy', 'feasible', 'possible to', 'enough for', 'trip to', 'vacation'];
const COMPARISON_KEYWORDS = ['compare', 'versus', 'vs', 'difference between', 'which is more'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { query } = await req.json();
    const queryLower = query.toLowerCase();
    console.log(`[NLQ] Processing query for user ${user.id}: "${query}"`);

    // Check for affordability queries -> Feasibility Calculator
    const isAffordabilityQuery = AFFORDABILITY_KEYWORDS.some(kw => queryLower.includes(kw));
    if (isAffordabilityQuery) {
      // Extract amount from query (basic pattern matching)
      const amountMatch = query.match(/\$?([\d,]+)/);
      const goalAmount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, '')) : 3000;
      
      // Fetch user's savings data
      const { data: pots } = await supabaseClient
        .from('pots')
        .select('current_amount')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      const { data: transactions } = await supabaseClient
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .gte('transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      const currentSavings = pots?.reduce((sum, p) => sum + Number(p.current_amount || 0), 0) || 0;
      const positiveTotal = transactions?.filter(t => Number(t.amount) > 0).reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
      const monthlyIncome = (positiveTotal / 3) || 3000;
      const negativeTotal = transactions?.filter(t => Number(t.amount) < 0).reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
      const monthlyExpenses = Math.abs(negativeTotal) / 3;
      const monthlyCapacity = Math.max(100, Math.round((monthlyIncome - monthlyExpenses) * 0.3));

      const monthsNeeded = Math.ceil((goalAmount - currentSavings) / monthlyCapacity);
      const feasible = monthsNeeded <= 12;

      return new Response(JSON.stringify({
        type: 'ephemeral_widget',
        widget: {
          widget_type: 'feasibility_calculator',
          title: query.includes('trip') || query.includes('vacation') ? 'Trip Feasibility' : 'Goal Feasibility',
          interactive: true,
          data: {
            goalAmount,
            currentSavings: Math.round(currentSavings),
            monthlyCapacity,
            deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            feasible,
            confidenceScore: feasible ? 85 : 60,
            recommendation: feasible 
              ? `You can reach this goal by saving $${Math.ceil((goalAmount - currentSavings) / monthsNeeded)}/month for ${monthsNeeded} months.`
              : `This is a stretch goal. Consider extending your timeline or increasing monthly savings.`,
            alternatives: [
              { label: 'Aggressive', monthlyAmount: Math.round(monthlyCapacity * 1.2), months: Math.ceil((goalAmount - currentSavings) / (monthlyCapacity * 1.2)) },
              { label: 'Comfortable', monthlyAmount: monthlyCapacity, months: monthsNeeded },
              { label: 'Conservative', monthlyAmount: Math.round(monthlyCapacity * 0.7), months: Math.ceil((goalAmount - currentSavings) / (monthlyCapacity * 0.7)) }
            ]
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for comparison queries -> Comparison Widget
    const isComparisonQuery = COMPARISON_KEYWORDS.some(kw => queryLower.includes(kw));
    if (isComparisonQuery) {
      const { data: transactions } = await supabaseClient
        .from('transactions')
        .select('merchant, amount, category')
        .eq('user_id', user.id)
        .lt('amount', 0)
        .gte('transaction_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Extract comparison terms
      const categories: Record<string, number> = {};
      transactions?.forEach(tx => {
        const cat = tx.category || 'Other';
        categories[cat] = (categories[cat] || 0) + Math.abs(Number(tx.amount));
      });

      const sortedCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);

      if (sortedCategories.length >= 2) {
        const ratio = (sortedCategories[0][1] / sortedCategories[1][1]).toFixed(1);
        
        return new Response(JSON.stringify({
          type: 'ephemeral_widget',
          widget: {
            widget_type: 'comparison',
            title: `${sortedCategories[0][0]} vs ${sortedCategories[1][0]}`,
            interactive: false,
            data: {
              items: sortedCategories.map(([name, value]) => ({ name, value: Math.round(value), trend: 'stable' as const })),
              period: 'This Month',
              insight: `You spend ${ratio}x more on ${sortedCategories[0][0]} than ${sortedCategories[1][0]}.`
            }
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Default: Return standard chart response
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('merchant, amount, category, transaction_date')
      .eq('user_id', user.id)
      .gte('transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('transaction_date', { ascending: false })
      .limit(500);

    const categoryTotals: Record<string, number> = {};
    transactions?.forEach(tx => {
      const category = tx.category || 'Uncategorized';
      if (Number(tx.amount) < 0) {
        categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(Number(tx.amount));
      }
    });

    const chartData = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const total = chartData.reduce((sum, d) => sum + d.value, 0);
    const insight = `Your total spending is $${total.toFixed(2)}. ${chartData[0]?.name || 'General'} is your largest category.`;

    return new Response(JSON.stringify({ type: 'chart', chartData, insight }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[NLQ] Error:', error);
    return new Response(JSON.stringify({ 
      type: 'chart',
      error: error instanceof Error ? error.message : 'Failed to process query',
      chartData: [],
      insight: 'Unable to analyze your spending at this time.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
