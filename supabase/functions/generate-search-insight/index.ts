import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, transactions, filters } = await req.json();

    if (!query || !transactions) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Calculate insights from transactions
    const totalAmount = transactions.reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);
    const count = transactions.length;
    const avgAmount = count > 0 ? totalAmount / count : 0;

    // Extract date range
    const dates = transactions.map((tx: any) => new Date(tx.transaction_date));
    const minDate = new Date(Math.min(...dates.map((d: Date) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d: Date) => d.getTime())));

    // Generate AI insight using Gemini
    const systemPrompt = `You are a financial insights assistant. Given a user's search query and transaction data, generate a natural, conversational insight in one sentence. Focus on the most interesting finding.`;

    const userPrompt = `User Query: "${query}"
Transactions: ${count}
Total Amount: $${totalAmount.toFixed(2)}
Average: $${avgAmount.toFixed(2)}
Date Range: ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}

Generate a brief, natural language insight (max 30 words).`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI gateway error:', aiResponse.status);
      throw new Error('Failed to generate insight');
    }

    const aiData = await aiResponse.json();
    const insight = aiData.choices?.[0]?.message?.content || 
      `You spent $${Math.abs(totalAmount).toFixed(2)} across ${count} transactions.`;

    return new Response(
      JSON.stringify({
        insight,
        totalAmount,
        transactionCount: count,
        dateRange: {
          start: minDate.toISOString(),
          end: maxDate.toISOString(),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-search-insight:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
