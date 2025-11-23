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
    const { merchant, amount, category, frequency, competitorOffer } = await req.json();
    
    if (!merchant || !amount) {
      throw new Error('Merchant and amount are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let leverageContext = '';
    if (competitorOffer) {
      leverageContext = `\n\nCOMPETITOR LEVERAGE: ${competitorOffer.provider} offers ${competitorOffer.speed || 'service'} for $${competitorOffer.monthly_price}/${frequency} — that's $${(amount - competitorOffer.monthly_price).toFixed(0)} less. Use this as primary leverage.`;
    }

    const systemPrompt = `You are a consumer advocate and negotiation expert. Generate a ROLEPLAY DIALOGUE negotiation script.${leverageContext}

Format: You: [statement] / Agent: [response] / You: [counter]

Include loyalty + competitor pricing + 15-25% discount request.`;

    const userPrompt = `Generate negotiation script: ${merchant}, $${amount}/${frequency}, ${category}.${leverageContext ? ' Lead with competitor offer.' : ''}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const script = data.choices[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ script }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating negotiation script:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
