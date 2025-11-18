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

    // Calculate confidence helper function
    const calculateConfidence = (txCount: number, amountVariance: number, freqConsistency: number): number => {
      let confidence = 0.5; // Base confidence
      
      // More transactions = higher confidence
      if (txCount >= 5) confidence += 0.3;
      else if (txCount >= 3) confidence += 0.2;
      else confidence += 0.1;
      
      // Low amount variance = higher confidence
      if (amountVariance < 0.05) confidence += 0.15;
      else if (amountVariance < 0.1) confidence += 0.1;
      
      // Consistent frequency = higher confidence
      if (freqConsistency > 0.9) confidence += 0.15;
      else if (freqConsistency > 0.7) confidence += 0.1;
      
      return Math.min(confidence, 1.0);
    };

    const calculateFrequencyConsistency = (dates: Date[]): number => {
      if (dates.length < 3) return 0.5;
      
      const intervals = [];
      for (let i = 1; i < dates.length; i++) {
        const days = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
        intervals.push(days);
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, val) => sum + Math.abs(val - avgInterval), 0) / intervals.length;
      
      return Math.max(0, 1 - (variance / avgInterval));
    };

    // Detect subscriptions: merchants with 2+ transactions of similar amounts
    for (const [merchant, txs] of Object.entries(merchantGroups)) {
      if (txs.length < 2) continue;

      // Check if amounts are similar (within 10% variance)
      const amounts = txs.map(t => parseFloat(t.amount));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const amountVarianceValue = amounts.reduce((sum, amt) => sum + Math.abs(amt - avgAmount), 0) / (amounts.length * avgAmount);
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

        // Calculate confidence score
        const freqConsistency = calculateFrequencyConsistency(dates);
        const confidence = calculateConfidence(txs.length, amountVarianceValue, freqConsistency);

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
            confidence: confidence,
            status: 'active',
            confirmed: false,
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
