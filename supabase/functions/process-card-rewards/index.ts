import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CardTransaction {
  id: string;
  user_id: string;
  card_id: string;
  amount_cents: number;
  merchant: string;
  category?: string;
}

interface SpendRule {
  id: string;
  user_id: string;
  card_id: string;
  rule_type: 'percentage' | 'flat_amount' | 'round_up';
  rule_value: number;
  destination_goal_id?: string;
  destination_pot_id?: string;
  is_active: boolean;
  total_saved: number;
  times_triggered: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { transaction } = await req.json();

    if (!transaction?.id) {
      return new Response(
        JSON.stringify({ error: 'Transaction ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing rewards for transaction:', transaction.id);

    // Get active spend rules for this card
    const { data: rules, error: rulesError } = await supabase
      .from('card_spend_rules')
      .select('*')
      .eq('user_id', transaction.user_id)
      .eq('card_id', transaction.card_id)
      .eq('is_active', true);

    if (rulesError) throw rulesError;

    const appliedRules: any[] = [];
    const pointsEarned: any[] = [];

    // Process each active rule
    for (const rule of rules || []) {
      const amountDollars = transaction.amount_cents / 100;
      let saveAmount = 0;

      switch (rule.rule_type) {
        case 'percentage':
          saveAmount = amountDollars * (rule.rule_value / 100);
          break;
        case 'flat_amount':
          saveAmount = rule.rule_value;
          break;
        case 'round_up':
          saveAmount = Math.ceil(amountDollars) - amountDollars;
          break;
      }

      if (saveAmount > 0) {
        // Update destination (goal or pot)
        if (rule.destination_goal_id) {
          const { error: goalError } = await supabase.rpc('contribute_to_goal', {
            p_goal_id: rule.destination_goal_id,
            p_amount: saveAmount,
            p_user_id: transaction.user_id,
            p_note: `Save-While-Spend: ${rule.rule_type}`
          });
          if (goalError) console.error('Goal update error:', goalError);
        } else if (rule.destination_pot_id) {
          const { error: potError } = await supabase
            .from('pots')
            .update({
              current_amount: supabase.raw(`current_amount + ${saveAmount}`)
            })
            .eq('id', rule.destination_pot_id);
          if (potError) console.error('Pot update error:', potError);
        }

        // Update rule statistics
        await supabase
          .from('card_spend_rules')
          .update({
            total_saved: rule.total_saved + saveAmount,
            times_triggered: rule.times_triggered + 1
          })
          .eq('id', rule.id);

        appliedRules.push({
          rule_id: rule.id,
          rule_name: rule.rule_name,
          amount_saved: saveAmount
        });

        // Award rule reward points (10 points per dollar saved)
        const rulePoints = Math.floor(saveAmount * 10);
        if (rulePoints > 0) {
          await supabase.from('card_points_ledger').insert({
            user_id: transaction.user_id,
            card_id: transaction.card_id,
            transaction_id: transaction.id,
            points_amount: rulePoints,
            points_type: 'rule_reward',
            description: `Rule: ${rule.rule_name}`
          });
          pointsEarned.push({ type: 'rule_reward', points: rulePoints });
        }
      }
    }

    // Award base points (1 point per dollar spent)
    const basePoints = Math.floor(transaction.amount_cents / 100);
    
    // Get tier multiplier
    const { data: tierStatus } = await supabase
      .from('card_tier_status')
      .select('current_tier')
      .eq('user_id', transaction.user_id)
      .maybeSingle();

    const tierMultipliers: Record<string, number> = {
      basic: 1.0,
      growth: 1.25,
      prestige: 1.5,
      elite_legacy: 2.0
    };

    const multiplier = tierMultipliers[tierStatus?.current_tier || 'basic'];
    const finalPoints = Math.floor(basePoints * multiplier);

    await supabase.from('card_points_ledger').insert({
      user_id: transaction.user_id,
      card_id: transaction.card_id,
      transaction_id: transaction.id,
      points_amount: finalPoints,
      points_type: 'base',
      multiplier: multiplier,
      description: `Purchase at ${transaction.merchant}`
    });

    pointsEarned.push({ type: 'base', points: finalPoints, multiplier });

    // Update tier total points
    await supabase
      .from('card_tier_status')
      .update({
        total_points: supabase.raw(`total_points + ${finalPoints}`),
        lifetime_points: supabase.raw(`lifetime_points + ${finalPoints}`)
      })
      .eq('user_id', transaction.user_id);

    console.log('Rewards processed:', { appliedRules, pointsEarned });

    return new Response(
      JSON.stringify({
        success: true,
        rules_applied: appliedRules.length,
        points_earned: pointsEarned.reduce((sum, p) => sum + p.points, 0),
        details: {
          rules: appliedRules,
          points: pointsEarned
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing card rewards:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
