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

    console.log('Calculating benchmarks for user:', user.id);

    // Calculate user's savings rate
    const { data: userGoals } = await supabase
      .from('goals')
      .select('current_amount, target_amount')
      .eq('user_id', user.id);

    const totalSaved = userGoals?.reduce((sum, g) => sum + parseFloat(g.current_amount.toString()), 0) || 0;
    const savingsRate = totalSaved > 0 ? (totalSaved / 12) : 0; // Monthly average

    // Calculate peer averages (anonymized aggregate)
    const { data: allUsersSavings } = await supabase
      .from('goals')
      .select('current_amount');

    const allSavings = allUsersSavings?.map(g => parseFloat(g.current_amount.toString())) || [];
    const peerAverage = allSavings.length > 0 
      ? allSavings.reduce((sum, s) => sum + s, 0) / allSavings.length 
      : 0;

    // Calculate percentile
    const sorted = [...allSavings].sort((a, b) => a - b);
    const userRank = sorted.filter(s => s < totalSaved).length;
    const percentile = Math.round((userRank / sorted.length) * 100);

    const benchmarks = [
      {
        user_id: user.id,
        benchmark_type: 'savings_rate',
        user_value: savingsRate,
        peer_average: peerAverage / 12,
        peer_percentile: percentile,
        demographic_group: 'all_users'
      }
    ];

    // Calculate debt ratio if user has debts
    const { data: userDebts } = await supabase
      .from('debts')
      .select('current_balance')
      .eq('user_id', user.id);

    if (userDebts && userDebts.length > 0) {
      const totalDebt = userDebts.reduce((sum, d) => sum + parseFloat(d.current_balance.toString()), 0);
      const debtToSavings = totalSaved > 0 ? totalDebt / totalSaved : 0;

      benchmarks.push({
        user_id: user.id,
        benchmark_type: 'debt_ratio',
        user_value: debtToSavings,
        peer_average: 0.5, // Industry standard
        peer_percentile: debtToSavings < 0.5 ? 75 : 25,
        demographic_group: 'all_users'
      });
    }

    // Store benchmarks
    await supabase.from('user_benchmarks').insert(benchmarks as any);

    return new Response(
      JSON.stringify({ benchmarks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating benchmarks:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});