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
    const { merchant, amount, category, frequency } = await req.json();
    
    if (!merchant || !amount) {
      throw new Error('Merchant and amount are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a consumer advocate and negotiation expert specializing in reducing bills and subscription costs. Your job is to generate persuasive, polite, and effective negotiation scripts that customers can use when contacting service providers.

Generate a professional negotiation script that includes:
1. Opening statement establishing loyalty and payment history
2. Reference to competitor pricing (research if needed)
3. Request for loyalty discount or promotional rate
4. Gentle mention of considering alternatives
5. Alternative asks if discount is denied (e.g., waived fees, extra features)

The script should be copy-pasteable and formatted with clear sections. Be specific, assertive but polite, and use proven negotiation tactics.`;

    const userPrompt = `Generate a negotiation script for reducing a ${category || 'subscription'} bill with ${merchant}. 

Current details:
- Service: ${merchant}
- Current cost: $${amount} per ${frequency}
- Category: ${category || 'subscription'}

Create a script that:
- Sounds natural and authentic
- References typical loyalty discounts (10-25%)
- Mentions competitor pricing when relevant
- Includes specific counter-offers
- Provides fallback options

Format the script with clear sections and make it ready to copy and paste.`;

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
