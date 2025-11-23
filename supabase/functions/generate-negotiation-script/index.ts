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
    const { merchant, amount, category, frequency, competitorOffer, leveragePoints, bloatItems, contractEndDate, customerTenure } = await req.json();
    
    if (!merchant || !amount) {
      throw new Error('Merchant and amount are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build leverage context
    let leverageContext = '';
    if (competitorOffer) {
      leverageContext = `\n\nCOMPETITOR LEVERAGE: ${competitorOffer.provider} offers ${competitorOffer.speed || 'service'} for $${competitorOffer.monthly_price}/${frequency} — that's $${(amount - competitorOffer.monthly_price).toFixed(0)} less. Use this as primary leverage.`;
    }

    // Add bloat items to context
    if (bloatItems && bloatItems.length > 0) {
      leverageContext += '\n\nREMOVABLE FEES: ';
      bloatItems.forEach((item: any) => {
        leverageContext += `${item.name} ($${item.amount}/mo), `;
      });
    }

    // Add leverage points
    if (leveragePoints && leveragePoints.length > 0) {
      leverageContext += '\n\nLEVERAGE POINTS: ' + leveragePoints.join(', ');
    }

    // Provider-specific tactics
    const providerTactics = {
      'Comcast': 'Reference Verizon Fios pricing, threaten cancellation, ask for loyalty department',
      'Xfinity': 'Reference Verizon Fios pricing, threaten cancellation, ask for loyalty department',
      'AT&T': 'Mention T-Mobile 5G Home Internet, ask for loyalty credits, reference new customer rates',
      'Verizon': 'Compare to Spectrum, reference promotional rates for new customers, mention contract end date',
      'T-Mobile': 'Compare to Visible/Mint Mobile, push for plan downgrades, ask about retention offers',
      'Spectrum': 'Reference AT&T Fiber, ask about retention department, mention switching is easy',
      'Cox': 'Reference local fiber providers, ask for promotional pricing, mention contract cancellation',
      'CenturyLink': 'Compare to cable competitors, reference fiber availability, ask for price match',
    };

    const providerTactic = providerTactics[merchant as keyof typeof providerTactics] || 'Compare to competitors, reference market rates, threaten to switch';

    const systemPrompt = `You are an expert bill negotiation coach with 15+ years of experience saving customers money. Generate an AGGRESSIVE, TACTICAL roleplay dialogue script.

RULES:
1. Start STRONG - immediately reference competitor pricing or loyalty (${customerTenure || 2}+ years)
2. Be SPECIFIC - use exact dollar amounts and plan details
3. Be ASSERTIVE - don't accept first offers, push for 20-30% savings
4. Use LEVERAGE - mention contract cancellation, switching threats ${contractEndDate ? '(contract ends soon)' : ''}
5. Format as realistic back-and-forth: "You:" then "Agent:" then "You:"
6. Include 4-6 exchanges minimum
7. End with you getting a WIN (discount secured or escalation to retention)

PROVIDER-SPECIFIC TACTICS for ${merchant}: ${providerTactic}

${leverageContext}

TONE: Confident, polite but firm, data-driven. You're not angry, just informed and willing to leave.`;

    const userPrompt = `Generate a tough negotiation script for ${merchant}, currently paying $${amount}/${frequency} for ${category}.
${competitorOffer ? 'Lead with the competitor offer as primary leverage.' : 'Focus on loyalty and market competition.'}
Customer has been with provider for ${customerTenure || 2} years. ${contractEndDate ? `Contract ends on ${contractEndDate} (use this as leverage).` : 'Contract is active.'}
${bloatItems && bloatItems.length > 0 ? `Remove these bloat fees: ${bloatItems.map((i: any) => `${i.name} ($${i.amount})`).join(', ')}` : ''}`;

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
