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

    const systemPrompt = `You are a consumer advocate and negotiation expert specializing in reducing bills and subscription costs. Your job is to generate persuasive, polite, and effective negotiation scripts formatted as a ROLEPLAY DIALOGUE.

Format the script as a conversation between YOU (the customer) and AGENT (the service representative):

You: [Your opening statement]
Agent: [Expected agent response]
You: [Your counter-offer or request]
Agent: [Possible objection]
You: [Your final persuasive argument]

Include:
1. Opening with loyalty and payment history
2. Competitor pricing references
3. Request for specific discount percentage
4. Fallback options (waived fees, extra features)
5. Polite but firm closing

Make it feel like a real conversation with natural dialogue.`;

    const userPrompt = `Generate a roleplay negotiation script for reducing a ${category || 'subscription'} bill with ${merchant}. 

Current details:
- Service: ${merchant}
- Current cost: $${amount} per ${frequency}
- Category: ${category || 'subscription'}

Format as dialogue:
You: [natural opening]
Agent: [typical agent response]
You: [your persuasive request with specific numbers]
Agent: [possible objection]
You: [counter-argument with alternatives]

Make it conversational, specific, and include:
- Mention being a loyal customer (assumed 2+ years)
- Reference competitor pricing (be specific)
- Ask for 15-25% discount
- Fallback: waive fees OR upgrade service tier
- End with polite but firm closing`;

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
