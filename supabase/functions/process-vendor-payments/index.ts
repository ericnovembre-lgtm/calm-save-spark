import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Starting vendor payment processing...');
    const now = new Date();

    // Fetch all active scheduled payments that are due
    const { data: scheduledPayments, error: fetchError } = await supabaseClient
      .from('scheduled_vendor_payments')
      .select('*, vendors(*)')
      .eq('is_active', true)
      .lte('next_payment_date', now.toISOString());

    if (fetchError) {
      console.error('Error fetching scheduled payments:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${scheduledPayments?.length || 0} payments to process`);

    let processedCount = 0;
    const results = [];

    for (const payment of scheduledPayments || []) {
      try {
        // Create a business expense record for this payment
        const { error: expenseError } = await supabaseClient
          .from('business_expenses')
          .insert({
            user_id: payment.user_id,
            business_profile_id: payment.business_profile_id,
            vendor_id: payment.vendor_id,
            amount: payment.amount,
            currency: payment.currency,
            description: `Scheduled payment to ${payment.vendors?.vendor_name || 'vendor'}`,
            category: 'professional_services',
            tax_category: 'professional_services',
            expense_date: now.toISOString(),
          });

        if (expenseError) {
          console.error(`Error creating expense for payment ${payment.id}:`, expenseError);
          results.push({ paymentId: payment.id, success: false, error: expenseError.message });
          continue;
        }

        // Calculate next payment date
        let nextDate = new Date(payment.next_payment_date);
        switch (payment.frequency) {
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case 'quarterly':
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
        }

        // Update the scheduled payment
        const { error: updateError } = await supabaseClient
          .from('scheduled_vendor_payments')
          .update({
            last_payment_date: now.toISOString(),
            next_payment_date: nextDate.toISOString(),
          })
          .eq('id', payment.id);

        if (updateError) {
          console.error(`Error updating payment ${payment.id}:`, updateError);
          results.push({ paymentId: payment.id, success: false, error: updateError.message });
          continue;
        }

        // Create a notification
        await supabaseClient.from('user_alerts').insert({
          user_id: payment.user_id,
          alert_type: 'vendor_payment',
          message: `Processed scheduled payment of $${payment.amount} to ${payment.vendors?.vendor_name || 'vendor'}`,
          is_read: false,
        });

        processedCount++;
        results.push({ paymentId: payment.id, success: true });
        console.log(`Successfully processed payment ${payment.id}`);
      } catch (error: any) {
        console.error(`Error processing payment ${payment.id}:`, error);
        results.push({ paymentId: payment.id, success: false, error: error.message });
      }
    }

    console.log(`Processed ${processedCount} vendor payments`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        total: scheduledPayments?.length || 0,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in process-vendor-payments:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
