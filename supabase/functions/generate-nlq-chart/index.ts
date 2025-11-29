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
    console.log(`[NLQ] Processing query for user ${user.id}: "${query}"`);

    // Fetch recent transactions
    const { data: transactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('merchant, amount, category, transaction_date')
      .eq('user_id', user.id)
      .gte('transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('transaction_date', { ascending: false })
      .limit(500);

    if (txError) {
      console.error('[NLQ] Transaction fetch error:', txError);
      throw txError;
    }

    // Parse query keywords
    const queryLower = query.toLowerCase();
    let chartData: Array<{ name: string; value: number }> = [];
    let insight = '';

    // Category-based analysis
    const categoryKeywords: Record<string, string[]> = {
      'food': ['coffee', 'food', 'restaurant', 'dining', 'eat', 'lunch', 'dinner', 'breakfast'],
      'groceries': ['groceries', 'grocery', 'supermarket', 'market'],
      'transport': ['transport', 'uber', 'lyft', 'gas', 'fuel', 'car', 'transit'],
      'shopping': ['shopping', 'amazon', 'store', 'buy', 'purchase'],
      'entertainment': ['entertainment', 'netflix', 'spotify', 'movie', 'game'],
      'utilities': ['utilities', 'electric', 'water', 'internet', 'phone'],
      'subscriptions': ['subscription', 'recurring', 'monthly'],
    };

    // Find matching category from query
    let targetCategory: string | null = null;
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => queryLower.includes(kw))) {
        targetCategory = category;
        break;
      }
    }

    if (targetCategory) {
      // Filter transactions by category/merchant
      const relevantTx = transactions?.filter(tx => {
        const merchant = (tx.merchant || '').toLowerCase();
        const category = (tx.category || '').toLowerCase();
        return categoryKeywords[targetCategory!].some(kw => 
          merchant.includes(kw) || category.includes(kw)
        );
      }) || [];

      // Group by merchant
      const merchantTotals: Record<string, number> = {};
      relevantTx.forEach(tx => {
        const merchant = tx.merchant || 'Unknown';
        merchantTotals[merchant] = (merchantTotals[merchant] || 0) + Math.abs(Number(tx.amount));
      });

      chartData = Object.entries(merchantTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      const total = chartData.reduce((sum, d) => sum + d.value, 0);
      insight = chartData.length > 0
        ? `You've spent $${total.toFixed(2)} on ${targetCategory} across ${chartData.length} merchants in the last 90 days. ${chartData[0]?.name} is your top expense at $${chartData[0]?.value.toFixed(2)}.`
        : `No ${targetCategory} expenses found in the last 90 days.`;

    } else {
      // Default: Show spending by category
      const categoryTotals: Record<string, number> = {};
      transactions?.forEach(tx => {
        const category = tx.category || 'Uncategorized';
        if (Number(tx.amount) < 0) {
          categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(Number(tx.amount));
        }
      });

      chartData = Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      const total = chartData.reduce((sum, d) => sum + d.value, 0);
      insight = `Your total spending over the last 90 days is $${total.toFixed(2)}. ${chartData[0]?.name || 'General'} is your largest category at $${chartData[0]?.value.toFixed(2) || '0'}.`;
    }

    console.log(`[NLQ] Generated ${chartData.length} data points for query`);

    return new Response(JSON.stringify({ chartData, insight }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[NLQ] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process query';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      chartData: [],
      insight: 'Unable to analyze your spending at this time.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
