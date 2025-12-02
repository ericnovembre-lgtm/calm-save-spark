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
    const { age, netWorth, lifeEvents, personalityTone = 'balanced' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const eventsDescription = lifeEvents.length > 0
      ? lifeEvents.map((e: any) => `${e.label} at age ${e.year}`).join(', ')
      : 'no major life events';

    // Determine emotional tone based on net worth trajectory
    let emotionalTone = 'neutral and factual';
    if (netWorth >= 1000000) {
      emotionalTone = 'celebratory and empowering';
    } else if (netWorth >= 500000) {
      emotionalTone = 'optimistic and encouraging';
    } else if (netWorth >= 100000) {
      emotionalTone = 'supportive and motivating';
    } else if (netWorth < 0) {
      emotionalTone = 'compassionate but solution-focused';
    }

    // Adjust tone based on personality
    const toneAdjustments: Record<string, string> = {
      conservative: 'Use cautious language, emphasize security and risk management',
      balanced: 'Balance optimism with realism, acknowledge both opportunities and challenges',
      aggressive: 'Be bold and ambitious, focus on growth potential and upside scenarios',
    };

    const toneInstruction = toneAdjustments[personalityTone] || toneAdjustments.balanced;

    const prompt = `Generate a single, story-driven narrative sentence (max 40 words) about a person's financial future:
    
- Current age: ${age}
- Net worth: $${netWorth.toLocaleString()}
- Life events: ${eventsDescription}
- Emotional tone: ${emotionalTone}
- Personality adjustment: ${toneInstruction}

Focus on what this means for their life, not just numbers. Be inspiring if they're doing well, or motivating if they face challenges. Use phrases like "You are free" or "Financial independence" for milestones above $1M. For challenging situations, focus on the path forward.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a financial storyteller. Create concise, impactful, emotion-aware narratives about financial futures. Adapt your tone to the user\'s financial state and personality.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API returned ${response.status}`);
    }

    const data = await response.json();
    const narrative = data.choices[0]?.message?.content || 
      `At age ${age}, your net worth stands at $${(netWorth / 1000).toFixed(0)}K. Your future is taking shape.`;

    return new Response(JSON.stringify({ 
      narrative,
      emotional_tone: emotionalTone,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in digital-twin-narrative:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
