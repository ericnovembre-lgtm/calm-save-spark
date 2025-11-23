import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch all user transactions grouped by merchant
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('id, merchant, amount, category, transaction_date')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(500);

    if (txError) {
      throw txError;
    }

    // Group by merchant
    const merchantGroups = transactions.reduce((acc: any, tx: any) => {
      const merchant = tx.merchant || 'Unknown';
      if (!acc[merchant]) acc[merchant] = [];
      acc[merchant].push(tx);
      return acc;
    }, {});

    const detectedRecurring = [];

    // Analyze each merchant group
    for (const [merchant, txs] of Object.entries(merchantGroups)) {
      const txArray = txs as any[];
      
      if (txArray.length < 3) continue; // Need at least 3 transactions

      // Sort by date
      txArray.sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());

      // Calculate intervals
      const dates = txArray.map(tx => new Date(tx.transaction_date).getTime());
      const intervals = [];
      for (let i = 0; i < dates.length - 1; i++) {
        intervals.push((dates[i + 1] - dates[i]) / (1000 * 60 * 60 * 24)); // days
      }

      if (intervals.length < 2) continue;

      // Calculate average interval and variance
      const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
      const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);

      // Check if it's recurring (consistent intervals)
      const isRecurring = stdDev < 5; // Allow 5 days variance
      const confidence = isRecurring ? Math.max(0.7, 1 - (stdDev / avgInterval)) : 0;

      if (isRecurring && confidence > 0.7) {
        const frequency = 
          avgInterval <= 10 ? 'weekly' :
          avgInterval <= 35 ? 'monthly' :
          avgInterval <= 100 ? 'quarterly' : 'yearly';

        const avgAmount = txArray.reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0) / txArray.length;
        const expectedDate = Math.round(new Date(dates[dates.length - 1]).getDate());

        // Insert or update recurring transaction record
        const { error: insertError } = await supabase
          .from('recurring_transactions')
          .upsert({
            user_id: user.id,
            merchant,
            category: txArray[0].category,
            avg_amount: avgAmount,
            frequency,
            expected_date: expectedDate,
            confidence,
            last_occurrence: txArray[txArray.length - 1].transaction_date,
          }, {
            onConflict: 'user_id,merchant',
          });

        if (insertError) {
          console.error('Error upserting recurring transaction:', insertError);
        }

        detectedRecurring.push({
          merchant,
          frequency,
          confidence,
          transaction_count: txArray.length,
        });
      }
    }

    return new Response(
      JSON.stringify({
        detected: detectedRecurring.length,
        patterns: detectedRecurring,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in detect-recurring:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
