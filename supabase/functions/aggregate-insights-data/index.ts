import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Extract JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (!user || authError) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { timeframe = '6months' } = await req.json().catch(() => ({}));

    // Check cache first
    const cacheKey = `insights_agg_${timeframe}`;
    const { data: cached } = await supabaseClient
      .from('insights_cache')
      .select('data, expires_at')
      .eq('user_id', user.id)
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cached) {
      console.log('Returning cached insights data');
      return new Response(
        JSON.stringify(cached.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    if (timeframe === '6months') {
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (timeframe === '1year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      startDate.setMonth(startDate.getMonth() - 3);
    }

    // Fetch all necessary data in parallel
    const [transactionsRes, goalsRes] = await Promise.all([
      supabaseClient
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate.toISOString())
        .lte('transaction_date', endDate.toISOString()),
      supabaseClient
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
    ]);

    if (transactionsRes.error) throw transactionsRes.error;
    if (goalsRes.error) throw goalsRes.error;

    const transactions = transactionsRes.data || [];
    const goals = goalsRes.data || [];

    // Aggregate monthly spending
    const monthlySpending: Record<string, { spending: number; budget: number; status: string }> = {};
    
    transactions.forEach(t => {
      if (t.amount < 0) {
        const monthKey = t.transaction_date.substring(0, 7); // YYYY-MM
        if (!monthlySpending[monthKey]) {
          monthlySpending[monthKey] = { spending: 0, budget: 0, status: 'on-track' };
        }
        monthlySpending[monthKey].spending += Math.abs(t.amount);
      }
    });

    // Format monthly data
    const monthlyData = Object.entries(monthlySpending).map(([month, data]) => ({
      month,
      spending: data.spending,
      budget: data.budget || 0,
      status: data.spending > data.budget && data.budget > 0 ? 'over' : 
              data.spending < data.budget * 0.9 ? 'under' : 'on-track'
    }));

    // Calculate category totals
    const categoryTotals: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.amount < 0) {
        const category = t.category || 'Uncategorized';
        categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
      }
    });

    const aggregatedData = {
      monthlyData,
      categoryTotals,
      totalSpending: transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      transactionCount: transactions.length,
      goalsCount: goals.length,
      timeframe,
      generatedAt: new Date().toISOString()
    };

    // Cache the result for 5 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await supabaseClient
      .from('insights_cache')
      .upsert({
        user_id: user.id,
        cache_key: cacheKey,
        data: aggregatedData,
        expires_at: expiresAt.toISOString()
      });

    return new Response(
      JSON.stringify(aggregatedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('aggregate-insights-data error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
