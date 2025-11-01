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

    const { ruleId, transactionAmount } = await req.json();

    // Fetch the automation rule
    const { data: rule } = await supabaseClient
      .from('automation_rules')
      .select('*')
      .eq('id', ruleId)
      .eq('user_id', user.id)
      .single();

    if (!rule || !rule.is_active) {
      return new Response(
        JSON.stringify({ success: false, message: 'Rule not found or inactive' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let amountToSave = 0;

    // Process based on rule type
    switch (rule.rule_type) {
      case 'round_up':
        // Round up to nearest dollar
        amountToSave = Math.ceil(transactionAmount) - transactionAmount;
        break;
      
      case 'percentage_save':
        // Save a percentage of transaction
        const percentage = rule.action_config.percentage || 10;
        amountToSave = (transactionAmount * percentage) / 100;
        break;
      
      case 'scheduled_transfer':
        // Fixed amount transfer
        amountToSave = rule.action_config.amount || 0;
        break;
      
      default:
        throw new Error('Unknown rule type');
    }

    // Apply the automation (update goal or pot)
    const targetType = rule.action_config.target_type; // 'goal' or 'pot'
    const targetId = rule.action_config.target_id;

    if (targetType === 'goal') {
      const { error } = await supabaseClient
        .from('goals')
        .update({ 
          current_amount: supabaseClient.rpc('increment', { amount: amountToSave }) 
        })
        .eq('id', targetId)
        .eq('user_id', user.id);

      if (error) throw error;
    } else if (targetType === 'pot') {
      const { error } = await supabaseClient
        .from('pots')
        .update({ 
          current_amount: supabaseClient.rpc('increment', { amount: amountToSave }) 
        })
        .eq('id', targetId)
        .eq('user_id', user.id);

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        amount_saved: amountToSave,
        rule_type: rule.rule_type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Process Automation Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});