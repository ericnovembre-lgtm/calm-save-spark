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
    const { transactionId, merchant, amount, category } = await req.json();

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: 'Missing transaction ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's auth info from request
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

    // Fetch related transactions from same merchant
    const { data: relatedTxs, error: txError } = await supabase
      .from('transactions')
      .select('amount, transaction_date')
      .eq('user_id', user.id)
      .eq('merchant', merchant)
      .order('transaction_date', { ascending: false })
      .limit(10);

    if (txError) {
      console.error('Error fetching transactions:', txError);
    }

    const transactions = relatedTxs || [];
    const amounts = transactions.map((tx: any) => parseFloat(tx.amount));
    const avgAmount = amounts.length > 0 
      ? amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length 
      : parseFloat(amount);

    // Calculate pattern
    let pattern: 'recurring' | 'one-time' | 'irregular' = 'one-time';
    let recurringInfo = undefined;

    if (transactions.length >= 3) {
      // Calculate intervals between transactions
      const dates = transactions.map((tx: any) => new Date(tx.transaction_date).getTime());
      const intervals = [];
      for (let i = 0; i < dates.length - 1; i++) {
        intervals.push(Math.abs(dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24)); // days
      }

      const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
      const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);

      // Check if it's recurring (low variance in intervals)
      if (stdDev < 5 && avgInterval < 35) {
        pattern = 'recurring';
        const frequency = avgInterval <= 10 ? 'weekly' : 'monthly';
        const confidence = Math.max(0.7, 1 - (stdDev / avgInterval));
        
        recurringInfo = {
          frequency,
          confidence,
          next_expected: new Date(dates[0] + avgInterval * 24 * 60 * 60 * 1000).toISOString(),
        };
      } else if (transactions.length > 1) {
        pattern = 'irregular';
      }
    }

    // Calculate percentile
    const currentAmount = Math.abs(parseFloat(amount));
    const belowCount = amounts.filter(amt => Math.abs(amt) < currentAmount).length;
    const percentile = amounts.length > 0 ? Math.round((belowCount / amounts.length) * 100) : 50;

    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (amounts.length >= 3) {
      const recentAvg = amounts.slice(0, 3).reduce((sum, amt) => sum + Math.abs(amt), 0) / 3;
      const olderAvg = amounts.slice(3).reduce((sum, amt) => sum + Math.abs(amt), 0) / (amounts.length - 3);
      
      if (recentAvg > olderAvg * 1.2) trend = 'increasing';
      else if (recentAvg < olderAvg * 0.8) trend = 'decreasing';
    }

    // Generate AI insights
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a financial analysis assistant with expertise in decoding cryptic bank transaction descriptions.

Your tasks:
1. Decode the raw merchant name if it's cryptic (e.g., "ACH WID 9942" → "Direct deposit from payroll service")
2. Generate a brief, insightful observation about the transaction (max 25 words)

Be conversational and helpful.`;

    const userPrompt = `Raw merchant: ${merchant}
Transaction: $${currentAmount}
Category: ${category}
Pattern: ${pattern}
Historical avg: $${Math.abs(avgAmount).toFixed(2)}
Trend: ${trend}
Your percentile: ${percentile}%

Please provide:
1. A decoded/cleaned merchant name if the raw name is cryptic
2. A brief insight about this transaction`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI gateway error:', aiResponse.status);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || 
      `This is a ${pattern} transaction at ${merchant}.`;
    
    // Try to extract decoded merchant name from AI response
    let decodedMerchant = merchant;
    let insights = aiContent;
    
    // Look for patterns like "decoded: X" or "cleaned name: X"
    const decodedMatch = aiContent.match(/(?:decoded|cleaned|actual)(?:\s+name)?:\s*([^\n]+)/i);
    if (decodedMatch) {
      decodedMerchant = decodedMatch[1].trim();
      // Remove the decoded part from insights
      insights = aiContent.replace(decodedMatch[0], '').trim();
    }

    return new Response(
      JSON.stringify({
        insights,
        decoded_merchant: decodedMerchant !== merchant ? decodedMerchant : undefined,
        pattern,
        spending_context: {
          avg_amount: Math.abs(avgAmount),
          percentile,
          trend,
        },
        recurring_info: recurringInfo,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-transaction:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
