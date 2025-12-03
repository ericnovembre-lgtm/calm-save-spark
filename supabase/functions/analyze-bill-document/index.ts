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
    const { fileData, fileName, generateRandom } = await req.json();
    
    // Handle random bill generation
    if (generateRandom) {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY is not configured');
      }

      const systemPrompt = `You are a bill generation AI. Create a realistic negotiation scenario for a random service provider.

Choose from: Comcast, AT&T, Verizon, T-Mobile, Spectrum, Cox, CenturyLink, Optimum, Frontier

Generate:
1. Provider name (pick one from the list)
2. Realistic monthly amount ($50-$150)
3. Service category (internet, cable, mobile, utilities)
4. 2-4 removable "bloat" fees with realistic names and amounts:
   - Equipment rental fees ($10-$15)
   - Service protection plans ($5-$10)
   - Premium tech support ($8-$12)
   - Router/modem fees ($8-$15)
5. Contract end date (random date within next 90 days in YYYY-MM-DD format)
6. Customer tenure (1-5 years)
7. Calculate negotiation power score (0-100) based on:
   - Contract expiring soon (+30 if <60 days)
   - Number of bloat fees (+10 per fee)
   - Long tenure (+20 if >2 years)
   - Market competition (+20 for internet/mobile)
8. 3-5 specific leverage points the customer can use

Return ONLY valid JSON: { "provider": "", "amount": 0, "category": "", "bloat_items": [{"name":"", "amount":0}], "contract_end_date": "", "customer_tenure_years": 0, "negotiation_score": 0, "leverage_points": [] }`;

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
            { role: 'user', content: 'Generate a realistic bill negotiation scenario for a random provider with bloat fees and leverage points.' },
          ],
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      let result = data.choices[0]?.message?.content || '';

      if (result.includes('```json')) {
        result = result.split('```json')[1].split('```')[0].trim();
      } else if (result.includes('```')) {
        result = result.split('```')[1].split('```')[0].trim();
      }

      const analysis = JSON.parse(result);

      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!fileData) {
      throw new Error('File data is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert bill analyzer. Extract key information from bill documents and identify negotiation opportunities.

Extract the following:
1. Provider name
2. Current monthly amount
3. Contract end date (if visible)
4. Removable fees ("bloat" items like equipment rental, warranties, protection plans)
5. Service tier/plan name
6. Customer tenure (how long they've been a customer)

Then calculate a "Negotiation Power Score" (0-100) based on:
- Contract expiration proximity (+30 if within 60 days)
- Number of removable fees (+10 per fee)
- High-tier service (+20 if premium plan)
- Long tenure (+20 if customer >2 years)
- Market competition level (+20 if highly competitive category like internet/cable)

Identify specific leverage points the customer can use in negotiation.

Return JSON only: { "provider": "", "amount": 0, "bloat_items": [], "contract_end_date": "", "negotiation_score": 0, "leverage_points": [] }`;

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
          { 
            role: 'user', 
            content: `Analyze this bill document (${fileName}). Extract provider, amount, fees, and calculate negotiation power.`
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Credits required. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let result = data.choices[0]?.message?.content || '';

    // Extract JSON from markdown code blocks if present
    if (result.includes('```json')) {
      result = result.split('```json')[1].split('```')[0].trim();
    } else if (result.includes('```')) {
      result = result.split('```')[1].split('```')[0].trim();
    }

    const analysis = JSON.parse(result);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing bill document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
