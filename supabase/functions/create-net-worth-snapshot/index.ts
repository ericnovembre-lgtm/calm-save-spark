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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Not authenticated');
    }
    
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    console.log('Creating net worth snapshot for user:', user.id);

    // Fetch assets from various sources
    let totalAssets = 0;
    const assetBreakdown: Record<string, number> = {};

    // Get connected accounts (cash)
    const { data: accounts } = await supabaseClient
      .from('connected_accounts')
      .select('current_balance')
      .eq('user_id', user.id);

    if (accounts?.length) {
      const cashTotal = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
      assetBreakdown.cash = cashTotal;
      totalAssets += cashTotal;
    }

    // Get pots (savings)
    const { data: pots } = await supabaseClient
      .from('pots')
      .select('current_amount')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (pots?.length) {
      const savingsTotal = pots.reduce((sum, pot) => sum + (pot.current_amount || 0), 0);
      assetBreakdown.savings = savingsTotal;
      totalAssets += savingsTotal;
    }

    // Get goals (additional savings)
    const { data: goals } = await supabaseClient
      .from('goals')
      .select('current_amount')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (goals?.length) {
      const goalsTotal = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
      assetBreakdown.savings = (assetBreakdown.savings || 0) + goalsTotal;
      totalAssets += goalsTotal;
    }

    // Get investments from investment_holdings
    const { data: holdings } = await supabaseClient
      .from('investment_holdings')
      .select('current_value')
      .eq('user_id', user.id);

    if (holdings?.length) {
      const investmentsTotal = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);
      assetBreakdown.investments = investmentsTotal;
      totalAssets += investmentsTotal;
    }

    // Fetch liabilities (debts)
    let totalLiabilities = 0;
    const liabilityBreakdown: Record<string, number> = {};

    const { data: debts } = await supabaseClient
      .from('debts')
      .select('current_balance, debt_type')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (debts?.length) {
      debts.forEach(debt => {
        const amount = debt.current_balance || 0;
        totalLiabilities += amount;

        // Map debt types to liability categories
        const typeMapping: Record<string, string> = {
          'credit_card': 'credit_cards',
          'mortgage': 'mortgages',
          'student_loan': 'student_loans',
          'auto_loan': 'car_loans',
          'personal_loan': 'personal_loans',
        };
        const category = typeMapping[debt.debt_type] || 'other';
        liabilityBreakdown[category] = (liabilityBreakdown[category] || 0) + amount;
      });
    }

    const netWorth = totalAssets - totalLiabilities;
    const today = new Date().toISOString().split('T')[0];

    console.log(`Assets: $${totalAssets}, Liabilities: $${totalLiabilities}, Net Worth: $${netWorth}`);

    // Upsert snapshot (one per day per user)
    const { data: snapshot, error: snapshotError } = await supabaseClient
      .from('net_worth_snapshots')
      .upsert({
        user_id: user.id,
        snapshot_date: today,
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        net_worth: netWorth,
        asset_breakdown: assetBreakdown,
        liability_breakdown: liabilityBreakdown,
        snapshot_type: 'automatic',
      }, {
        onConflict: 'user_id,snapshot_date',
      })
      .select()
      .single();

    if (snapshotError) {
      console.error('Snapshot error:', snapshotError);
      throw snapshotError;
    }

    // Check for milestones
    const { data: previousSnapshot } = await supabaseClient
      .from('net_worth_snapshots')
      .select('net_worth')
      .eq('user_id', user.id)
      .lt('snapshot_date', today)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    const previousNetWorth = previousSnapshot?.net_worth ?? 0;

    // Check for positive net worth milestone
    if (previousNetWorth <= 0 && netWorth > 0) {
      await supabaseClient.from('net_worth_milestones').insert({
        user_id: user.id,
        milestone_type: 'positive_net_worth',
        milestone_value: netWorth,
        previous_value: previousNetWorth,
        notes: 'Crossed into positive net worth!',
      });
      console.log('Milestone achieved: Positive net worth!');
    }

    // Check for round number milestones
    const roundMilestones = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];
    for (const milestone of roundMilestones) {
      if (previousNetWorth < milestone && netWorth >= milestone) {
        // Check if already achieved
        const { data: existing } = await supabaseClient
          .from('net_worth_milestones')
          .select('id')
          .eq('user_id', user.id)
          .eq('milestone_type', 'round_number')
          .eq('milestone_value', milestone)
          .single();

        if (!existing) {
          await supabaseClient.from('net_worth_milestones').insert({
            user_id: user.id,
            milestone_type: 'round_number',
            milestone_value: milestone,
            previous_value: previousNetWorth,
            notes: `Reached $${milestone.toLocaleString()}!`,
          });
          console.log(`Milestone achieved: $${milestone.toLocaleString()}!`);
        }
      }
    }

    // Check for all-time high
    const { data: allTimeHigh } = await supabaseClient
      .from('net_worth_snapshots')
      .select('net_worth')
      .eq('user_id', user.id)
      .order('net_worth', { ascending: false })
      .limit(1)
      .single();

    if (allTimeHigh && netWorth >= allTimeHigh.net_worth && netWorth > previousNetWorth) {
      // Only create if we haven't already recorded one this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: recentHighMilestone } = await supabaseClient
        .from('net_worth_milestones')
        .select('id')
        .eq('user_id', user.id)
        .eq('milestone_type', 'all_time_high')
        .gte('achieved_at', weekAgo.toISOString())
        .single();

      if (!recentHighMilestone) {
        await supabaseClient.from('net_worth_milestones').insert({
          user_id: user.id,
          milestone_type: 'all_time_high',
          milestone_value: netWorth,
          previous_value: previousNetWorth,
          notes: 'New all-time high net worth!',
        });
        console.log('Milestone achieved: All-time high!');
      }
    }

    console.log('Net worth snapshot created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        snapshot,
        summary: {
          totalAssets,
          totalLiabilities,
          netWorth,
          assetBreakdown,
          liabilityBreakdown,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Net Worth Snapshot Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
