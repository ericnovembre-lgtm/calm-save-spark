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

    // Fetch transactions from the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: transactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('transaction_date', ninetyDaysAgo.toISOString())
      .order('transaction_date', { ascending: false });

    if (txError) throw txError;

    // Group transactions by merchant to detect recurring patterns
    const merchantGroups: { [key: string]: any[] } = {};
    transactions?.forEach((tx) => {
      if (!tx.merchant) return;
      if (!merchantGroups[tx.merchant]) {
        merchantGroups[tx.merchant] = [];
      }
      merchantGroups[tx.merchant].push(tx);
    });

    const detectedSubs = [];

    // Detect subscriptions: merchants with 2+ transactions of similar amounts
    for (const [merchant, txs] of Object.entries(merchantGroups)) {
      if (txs.length < 2) continue;

      // Check if amounts are similar (within 10% variance)
      const amounts = txs.map(t => parseFloat(t.amount));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const variance = amounts.every(amt => Math.abs(amt - avgAmount) / avgAmount < 0.1);

      if (variance) {
        // Calculate frequency
        const dates = txs.map(t => new Date(t.transaction_date)).sort((a, b) => a.getTime() - b.getTime());
        const daysBetween = dates.length > 1 
          ? (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24) / (dates.length - 1)
          : 30;

        let frequency = 'monthly';
        if (daysBetween < 10) frequency = 'weekly';
        else if (daysBetween > 300) frequency = 'annual';

        // Check if already detected
        const { data: existing } = await supabaseClient
          .from('detected_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('merchant', merchant)
          .single();

        if (!existing) {
          const lastCharge = dates[dates.length - 1];
          const nextExpected = new Date(lastCharge);
          nextExpected.setDate(nextExpected.getDate() + Math.round(daysBetween));

          detectedSubs.push({
            user_id: user.id,
            merchant,
            amount: avgAmount,
            frequency,
            last_charge_date: lastCharge.toISOString(),
            next_expected_date: nextExpected.toISOString(),
            category: txs[0].category,
          });
        }
      }
    }

    // Insert new subscriptions
    if (detectedSubs.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('detected_subscriptions')
        .insert(detectedSubs);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscriptions_detected: detectedSubs.length,
        subscriptions: detectedSubs
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
