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

    console.log('Processing scheduled allowances...');

    const today = new Date().toISOString();

    // Fetch all active allowances that are due
    const { data: dueAllowances, error: allowancesError } = await supabaseClient
      .from('allowances')
      .select('*, family_groups(name)')
      .eq('is_active', true)
      .lte('next_payment_date', today);

    if (allowancesError) {
      console.error('Error fetching allowances:', allowancesError);
      throw allowancesError;
    }

    console.log(`Found ${dueAllowances?.length || 0} due allowances`);

    let processedCount = 0;
    let errorCount = 0;

    for (const allowance of dueAllowances || []) {
      try {
        // Calculate next payment date based on frequency
        const currentDate = new Date(allowance.next_payment_date);
        let nextDate = new Date(currentDate);

        switch (allowance.frequency) {
          case 'weekly':
            nextDate.setDate(currentDate.getDate() + 7);
            break;
          case 'biweekly':
            nextDate.setDate(currentDate.getDate() + 14);
            break;
          case 'monthly':
            nextDate.setMonth(currentDate.getMonth() + 1);
            break;
          default:
            nextDate.setDate(currentDate.getDate() + 7); // Default to weekly
        }

        // Find or create a savings pot for the child
        const { data: existingPot } = await supabaseClient
          .from('pots')
          .select('id, current_amount')
          .eq('user_id', allowance.child_user_id)
          .eq('name', 'Allowance')
          .single();

        let potId;
        let currentAmount = 0;

        if (existingPot) {
          potId = existingPot.id;
          currentAmount = Number(existingPot.current_amount);
        } else {
          // Create allowance pot
          const { data: newPot, error: potError } = await supabaseClient
            .from('pots')
            .insert([{
              user_id: allowance.child_user_id,
              name: 'Allowance',
              icon: 'piggy-bank',
              target_amount: Number(allowance.amount) * 52, // Annual target
              current_amount: 0,
              is_active: true,
            }])
            .select()
            .single();

          if (potError) throw potError;
          potId = newPot.id;
        }

        // Add allowance to pot
        const newAmount = currentAmount + Number(allowance.amount);
        const { error: updateError } = await supabaseClient
          .from('pots')
          .update({ current_amount: newAmount })
          .eq('id', potId);

        if (updateError) throw updateError;

        // Create transfer history record
        await supabaseClient
          .from('transfer_history')
          .insert([{
            user_id: allowance.child_user_id,
            pot_id: potId,
            amount: allowance.amount,
            transfer_type: 'allowance',
            status: 'completed',
          }]);

        // Update allowance next payment date
        const { error: allowanceUpdateError } = await supabaseClient
          .from('allowances')
          .update({ next_payment_date: nextDate.toISOString() })
          .eq('id', allowance.id);

        if (allowanceUpdateError) throw allowanceUpdateError;

        // Create user alert
        await supabaseClient
          .from('user_alerts')
          .insert([{
            user_id: allowance.child_user_id,
            alert_type: 'allowance_received',
            severity: 'info',
            title: 'Allowance Received!',
            message: `Your ${allowance.frequency} allowance of $${Number(allowance.amount).toFixed(2)} has been added to your Allowance pot.`,
            action_url: '/pots',
          }]);

        processedCount++;
        console.log(`Processed allowance ${allowance.id} for user ${allowance.child_user_id}`);
      } catch (error) {
        console.error(`Error processing allowance ${allowance.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Processed ${processedCount} allowances, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: processedCount,
        errors: errorCount,
        total: dueAllowances?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-allowances:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});