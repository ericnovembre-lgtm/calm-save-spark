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
    const { transactionId, userId, amount, category } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch active round-up rules for this user
    const { data: rules, error: rulesError } = await supabaseClient
      .from('round_up_rules')
      .select('*, goals(id, name, current_amount, target_amount)')
      .eq('user_id', userId)
      .eq('active', true);

    if (rulesError) throw rulesError;
    if (!rules || rules.length === 0) {
      return new Response(JSON.stringify({ message: 'No active round-up rules' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const roundUps: any[] = [];

    for (const rule of rules) {
      // Check if transaction category matches rule (if categories specified)
      if (rule.categories && rule.categories.length > 0) {
        if (!rule.categories.includes(category)) continue;
      }

      // Calculate round-up amount
      const roundUpBase = Math.ceil(Math.abs(amount)) - Math.abs(amount);
      const roundUpAmount = roundUpBase * rule.multiplier;

      if (roundUpAmount <= 0) continue;

      // Update goal amount
      const newAmount = (rule.goals.current_amount || 0) + roundUpAmount;
      const { error: updateError } = await supabaseClient
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', rule.goal_id);

      if (updateError) {
        console.error('Error updating goal:', updateError);
        continue;
      }

      // Update round-up rule total
      const { error: ruleUpdateError } = await supabaseClient
        .from('round_up_rules')
        .update({ 
          total_saved: (rule.total_saved || 0) + roundUpAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', rule.id);

      if (ruleUpdateError) {
        console.error('Error updating rule:', ruleUpdateError);
      }

      roundUps.push({
        goalId: rule.goal_id,
        goalName: rule.goals.name,
        amount: roundUpAmount,
        multiplier: rule.multiplier
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      roundUps,
      totalRoundedUp: roundUps.reduce((sum, r) => sum + r.amount, 0)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-round-ups:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});