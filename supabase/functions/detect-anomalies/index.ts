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
    const { timeframe = '30d' } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth
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

    // Calculate date range
    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[timeframe] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch transactions for timeframe
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('id, merchant, amount, transaction_date, category, description')
      .eq('user_id', user.id)
      .gte('transaction_date', startDate.toISOString())
      .order('transaction_date', { ascending: false });

    if (txError) {
      console.error('Error fetching transactions:', txError);
      throw txError;
    }

    if (!transactions || transactions.length === 0) {
      return new Response(
        JSON.stringify({ anomalies: [], summary: { total: 0, high: 0, medium: 0, low: 0 } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI to detect anomalies
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a financial anomaly detection expert. Analyze transactions for suspicious patterns.

Detect these anomaly types:
1. **duplicate**: Same merchant, similar amount (±$2) within 48 hours
2. **high_tip**: Restaurant/bar tip >30% of bill
3. **price_hike**: Same merchant charge >15% higher than previous
4. **outlier**: Amount >3x merchant's average
5. **unusual_merchant**: First-time charge >$100

Return JSON array ONLY (no markdown, no explanation):
[
  {
    "transactionId": "uuid",
    "anomalyType": "duplicate|high_tip|price_hike|outlier|unusual_merchant",
    "severity": "low|medium|high",
    "explanation": "Brief explanation (max 50 chars)",
    "suggestedAction": "Action to take (max 50 chars)"
  }
]

Be strict: Only flag true anomalies. Empty array if none found.`;

    const userPrompt = `Analyze these ${transactions.length} transactions from the past ${days} days:\n\n` +
      transactions.map((tx, i) => 
        `${i+1}. ${tx.transaction_date.split('T')[0]} | ${tx.merchant} | $${tx.amount} | ${tx.category || 'N/A'}`
      ).join('\n');

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
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    let anomalies = [];
    
    try {
      const content = aiData.choices?.[0]?.message?.content || '[]';
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      anomalies = JSON.parse(cleanContent);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      anomalies = [];
    }

    // Calculate summary
    const summary = {
      total: anomalies.length,
      high: anomalies.filter((a: any) => a.severity === 'high').length,
      medium: anomalies.filter((a: any) => a.severity === 'medium').length,
      low: anomalies.filter((a: any) => a.severity === 'low').length,
    };

    return new Response(
      JSON.stringify({ anomalies, summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in detect-anomalies:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
