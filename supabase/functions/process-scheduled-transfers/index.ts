import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting scheduled transfer processing...');

    // Get all active scheduled transfers that are due
    const now = new Date();
    const { data: dueTransfers, error: fetchError } = await supabase
      .from('scheduled_transfers')
      .select(`
        id,
        user_id,
        pot_id,
        amount,
        frequency,
        day_of_week,
        day_of_month,
        next_transfer_date,
        pots:pot_id (
          id,
          name,
          current_amount,
          target_amount
        )
      `)
      .eq('is_active', true)
      .lte('next_transfer_date', now.toISOString());

    if (fetchError) {
      console.error('Error fetching transfers:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${dueTransfers?.length || 0} transfers to process`);

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each transfer
    for (const transfer of dueTransfers || []) {
      try {
        const pot = transfer.pots as any;
        
        if (!pot) {
          throw new Error('Goal not found');
        }

        // Update pot balance
        const newAmount = parseFloat(String(pot.current_amount || 0)) + parseFloat(String(transfer.amount));
        
        const { error: updateError } = await supabase
          .from('pots')
          .update({ current_amount: newAmount })
          .eq('id', transfer.pot_id);

        if (updateError) throw updateError;

        // Log transfer in history
        const { error: historyError } = await supabase
          .from('transfer_history')
          .insert({
            user_id: transfer.user_id,
            pot_id: transfer.pot_id,
            amount: transfer.amount,
            transfer_type: 'scheduled',
            scheduled_transfer_id: transfer.id,
            status: 'completed',
          });

        if (historyError) throw historyError;

        // Calculate next transfer date
        const nextDate = new Date(transfer.next_transfer_date);
        
        if (transfer.frequency === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (transfer.frequency === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1);
          // Ensure we don't exceed the day_of_month if it's set
          if (transfer.day_of_month && nextDate.getDate() !== transfer.day_of_month) {
            nextDate.setDate(Math.min(transfer.day_of_month, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()));
          }
        }

        // Update scheduled transfer
        const { error: scheduleError } = await supabase
          .from('scheduled_transfers')
          .update({
            last_transfer_date: now.toISOString(),
            next_transfer_date: nextDate.toISOString(),
          })
          .eq('id', transfer.id);

        if (scheduleError) throw scheduleError;

        console.log(`Successfully processed transfer ${transfer.id}`);
        results.processed++;
      } catch (error) {
        console.error(`Failed to process transfer ${transfer.id}:`, error);
        
        // Log failed transfer
        await supabase
          .from('transfer_history')
          .insert({
            user_id: transfer.user_id,
            pot_id: transfer.pot_id,
            amount: transfer.amount,
            transfer_type: 'scheduled',
            scheduled_transfer_id: transfer.id,
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          });

        results.failed++;
        results.errors.push(`Transfer ${transfer.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('Processing complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scheduled transfers processed',
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing scheduled transfers:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});