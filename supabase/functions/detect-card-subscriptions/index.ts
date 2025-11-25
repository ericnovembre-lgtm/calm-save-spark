import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get card transactions from last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: transactions, error: txError } = await supabase
      .from('card_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_date', twelveMonthsAgo.toISOString())
      .order('transaction_date', { ascending: true });

    if (txError) throw txError;

    // Group by merchant
    const merchantGroups = new Map<string, typeof transactions>();
    
    transactions.forEach(tx => {
      const merchant = tx.ai_merchant_name || tx.merchant_name || 'Unknown';
      if (!merchantGroups.has(merchant)) {
        merchantGroups.set(merchant, []);
      }
      merchantGroups.get(merchant)!.push(tx);
    });

    const detectedSubscriptions = [];

    // Analyze each merchant group for recurring patterns
    for (const [merchant, txs] of merchantGroups.entries()) {
      if (txs.length < 2) continue; // Need at least 2 transactions

      // Sort by date
      txs.sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());

      // Calculate intervals between transactions
      const intervals = [];
      for (let i = 1; i < txs.length; i++) {
        const days = Math.round((new Date(txs[i].transaction_date).getTime() - new Date(txs[i-1].transaction_date).getTime()) / (1000 * 60 * 60 * 24));
        intervals.push(days);
      }

      // Check if intervals are consistent (±10% tolerance)
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const isConsistent = intervals.every(interval => 
        Math.abs(interval - avgInterval) <= avgInterval * 0.1
      );

      if (!isConsistent) continue;

      // Determine frequency
      let frequency = 'monthly';
      if (avgInterval <= 9) frequency = 'weekly';
      else if (avgInterval <= 35) frequency = 'monthly';
      else if (avgInterval <= 100) frequency = 'quarterly';
      else frequency = 'yearly';

      // Calculate next expected date
      const lastTx = txs[txs.length - 1];
      const nextDate = new Date(lastTx.transaction_date);
      nextDate.setDate(nextDate.getDate() + avgInterval);

      // Calculate average amount
      const avgAmount = Math.round(txs.reduce((sum, tx) => sum + Math.abs(tx.amount_cents), 0) / txs.length);

      // Calculate confidence
      const amountVariance = txs.reduce((variance, tx) => {
        const diff = Math.abs(Math.abs(tx.amount_cents) - avgAmount);
        return variance + (diff / avgAmount);
      }, 0) / txs.length;

      const confidence = Math.max(0.5, Math.min(0.99, 1 - amountVariance));

      // Upsert subscription
      const { error: upsertError } = await supabase
        .from('card_subscriptions')
        .upsert({
          user_id: userId,
          card_id: lastTx.card_id,
          merchant_name: merchant,
          ai_merchant_name: lastTx.ai_merchant_name,
          amount_cents: avgAmount,
          frequency,
          first_detected_at: txs[0].transaction_date,
          last_charge_date: lastTx.transaction_date,
          next_expected_date: nextDate.toISOString(),
          confidence,
          status: 'active',
          category: lastTx.ai_category
        }, {
          onConflict: 'user_id,merchant_name',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Error upserting subscription:', upsertError);
      } else {
        detectedSubscriptions.push({
          merchant,
          frequency,
          amount: avgAmount / 100,
          nextDate,
          confidence
        });
      }
    }

    console.log(`Detected ${detectedSubscriptions.length} subscriptions for user ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      detectedCount: detectedSubscriptions.length,
      subscriptions: detectedSubscriptions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in detect-card-subscriptions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});