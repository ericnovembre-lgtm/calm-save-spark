import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      merchant, 
      amount, 
      category, 
      frequency, 
      competitorOffer, 
      leveragePoints, 
      bloatItems, 
      contractEndDate, 
      customerTenure,
      generateVariants = false,
      opportunityId
    } = await req.json();
    
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

    if (bloatItems && bloatItems.length > 0) {
      leverageContext += '\n\nREMOVABLE FEES: ';
      bloatItems.forEach((item: any) => {
        leverageContext += `${item.name} ($${item.amount}/mo), `;
      });
    }

    if (leveragePoints && leveragePoints.length > 0) {
      leverageContext += '\n\nLEVERAGE POINTS: ' + leveragePoints.join(', ');
    }

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

    const userPrompt = `Generate a tough negotiation script for ${merchant}, currently paying $${amount}/${frequency} for ${category}.
${competitorOffer ? 'Lead with the competitor offer as primary leverage.' : 'Focus on loyalty and market competition.'}
Customer has been with provider for ${customerTenure || 2} years. ${contractEndDate ? `Contract ends on ${contractEndDate} (use this as leverage).` : 'Contract is active.'}
${bloatItems && bloatItems.length > 0 ? `Remove these bloat fees: ${bloatItems.map((i: any) => `${i.name} ($${i.amount})`).join(', ')}` : ''}`;

    // If generateVariants is true, create 3 different scripts
    if (generateVariants) {
      const startTime = Date.now();
      
      // Create 3 distinct prompts
      const aggressivePrompt = `You are a HARD-NOSED negotiation expert trained in high-pressure sales. Generate an AGGRESSIVE, NO-NONSENSE script.

PERSONALITY:
- Direct and confrontational
- Uses switching threats as primary weapon
- Refuses to accept first offers
- Demands retention department immediately
- Emphasizes competition heavily
- Willing to walk away

LANGUAGE:
- "I'm prepared to cancel today"
- "This is well above market rates"
- "I've already spoken to [Competitor]"
- "I need you to match this or I'm out"

TACTICS:
- Lead with competitor pricing
- Reference loyalty aggressively
- Push for 30-40% savings
- Mention cancellation 2-3 times
- Escalate to retention early

PROVIDER-SPECIFIC TACTICS for ${merchant}: ${providerTactic}
${leverageContext}

Generate 4-6 exchanges. End with: "If you can't match that, transfer me to cancellations."`;

      const friendlyPrompt = `You are a RELATIONSHIP-FOCUSED negotiation coach. Generate a FRIENDLY, COLLABORATIVE script.

PERSONALITY:
- Warm and empathetic
- Builds rapport first
- Frames negotiation as partnership
- Appreciates agent's position
- Uses loyalty and tenure as foundation
- Soft on people, hard on numbers

LANGUAGE:
- "I really value our relationship"
- "I know you're doing your best"
- "I'd love to stay with you, but..."
- "Can we work together on this?"

TACTICS:
- Start with appreciation and loyalty
- Acknowledge agent's constraints
- Use competitor offer as "reluctant alternative"
- Emphasize desire to stay
- Ask for "help" rather than demand

PROVIDER-SPECIFIC TACTICS for ${merchant}: ${providerTactic}
${leverageContext}

Generate 5-7 exchanges. End with: "I trust we can find a solution that works for both of us."`;

      const dataDrivenPrompt = `You are a HIGHLY ANALYTICAL negotiation expert. Generate a DATA-DRIVEN, FACT-BASED script.

PERSONALITY:
- Logical and methodical
- Uses specific numbers and percentages
- References market research
- Presents cost-benefit analysis
- Removes emotion from discussion
- Treats negotiation as business decision

LANGUAGE:
- "According to market data..."
- "New customers pay 32% less"
- "My cost per Mbps is..."
- "The ROI on this service doesn't align"

TACTICS:
- Lead with comparative pricing data
- Break down cost per unit ($/Mbps, $/GB)
- Reference industry benchmarks
- Calculate "new customer" savings
- Present switching as pure economics

PROVIDER-SPECIFIC TACTICS for ${merchant}: ${providerTactic}
${leverageContext}

Generate 4-6 exchanges. End with: "Economically, switching makes more sense unless we adjust the rate."`;

      // Generate all 3 scripts in parallel
      const [aggressiveResponse, friendlyResponse, dataDrivenResponse] = await Promise.all([
        fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: aggressivePrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.8,
            max_tokens: 1000,
          }),
        }),
        fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: friendlyPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.8,
            max_tokens: 1000,
          }),
        }),
        fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: dataDrivenPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.8,
            max_tokens: 1000,
          }),
        }),
      ]);

      if (!aggressiveResponse.ok || !friendlyResponse.ok || !dataDrivenResponse.ok) {
        throw new Error('Failed to generate one or more script variants');
      }

      const [aggressive, friendly, dataDriven] = await Promise.all([
        aggressiveResponse.json(),
        friendlyResponse.json(),
        dataDrivenResponse.json(),
      ]);

      const generationTime = Date.now() - startTime;

      const variants = {
        aggressive: aggressive.choices[0]?.message?.content || '',
        friendly: friendly.choices[0]?.message?.content || '',
        data_driven: dataDriven.choices[0]?.message?.content || '',
      };

      // Store variants in database
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
          const { data: variant, error } = await supabaseClient
            .from('negotiation_script_variants')
            .insert({
              user_id: user.id,
              opportunity_id: opportunityId,
              merchant,
              amount,
              aggressive_script: variants.aggressive,
              friendly_script: variants.friendly,
              data_driven_script: variants.data_driven,
              leverage_points: leveragePoints || [],
              bloat_items: bloatItems || [],
              competitor_offer: competitorOffer,
              generation_time_ms: generationTime,
            })
            .select()
            .single();

          if (error) {
            console.error('Error storing variants:', error);
          } else {
            return new Response(
              JSON.stringify({
                variants,
                variant_id: variant.id,
                generation_time_ms: generationTime,
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      return new Response(
        JSON.stringify({
          variants,
          generation_time_ms: generationTime,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Single script generation (legacy)
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
