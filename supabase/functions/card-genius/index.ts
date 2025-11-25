import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type GeniusMode = 'purchase' | 'travel' | 'dispute' | 'benefits';

interface GeniusRequest {
  mode: GeniusMode;
  query: string;
  context?: {
    cardId?: string;
    amount?: number;
    merchant?: string;
    destination?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, query, context }: GeniusRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Mode-specific system prompts
    const systemPrompts = {
      purchase: `You are a credit card purchase analyzer. Calculate points earned, identify applicable protections and insurance coverage. Be specific with numbers.`,
      travel: `You are a travel advisor for credit card users. Provide local payment customs, tipping culture, currency info, and warn about foreign transaction fees.`,
      dispute: `You are a banking dispute letter writer. Draft formal, professional dispute letters based on user's issue. Include account details placeholders.`,
      benefits: `You are a credit card benefits expert. Check if the user's question matches card protections (phone insurance, travel insurance, purchase protection, extended warranty). Provide coverage amounts.`
    };

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompts[mode] },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const result = aiData.choices[0].message.content;

    // Parse structured data based on mode
    let structured = {};
    
    if (mode === 'purchase') {
      // Extract points and protections from response
      const pointsMatch = result.match(/(\d+(?:,\d+)*)\s*points?/i);
      const protectionsMatch = result.match(/protections?:?\s*([^\n]+)/gi);
      
      structured = {
        points: pointsMatch ? parseInt(pointsMatch[1].replace(/,/g, '')) : null,
        protections: protectionsMatch?.map(p => p.replace(/protections?:?\s*/i, '').trim()) || []
      };
    }

    return new Response(
      JSON.stringify({
        mode,
        result,
        structured
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Card Genius error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
