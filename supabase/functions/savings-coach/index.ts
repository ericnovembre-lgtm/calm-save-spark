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
    const { potName, currentAmount, targetAmount, notes, createdAt } = await req.json();
    
    if (!potName || currentAmount === undefined || !targetAmount) {
      return new Response(
        JSON.stringify({ error: 'Missing required pot data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Calculate progress and time metrics
    const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    const remaining = targetAmount - currentAmount;
    const daysSinceCreation = createdAt ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const currentPace = daysSinceCreation > 0 ? currentAmount / daysSinceCreation : 0;

    // System prompt for personalized coaching
    const systemPrompt = `You are an enthusiastic, motivational financial coach specializing in goal-based savings.

Analyze the user's savings goal and provide ONE specific, actionable tip to help them reach it faster.

Guidelines:
- Be personal and reference the specific goal by name
- Calculate realistic timeframes based on current progress
- Suggest concrete weekly or monthly savings increases with specific dollar amounts
- Include a projected completion date when possible
- Be encouraging and use a warm, supportive tone
- Keep response under 60 words
- Use numbers and dates to make it actionable
- Reference the goal context (e.g., destination, item features)

Examples:
- "You're 43% of the way to your Tesla Model 3! If you increase your monthly deposit by $200, you'll be driving it by July 2026. That's skipping 2 dinners out per month!"
- "Amazing progress on your Kyoto trip! At your current pace, you'll be there in 8 months. Save just $15 more per week and you'll see cherry blossoms this spring!"
- "Your emergency fund is growing strong! You're almost halfway there. Set up a $50 auto-transfer every Friday and you'll have 6 months of security by December."

Avoid:
- Generic advice that could apply to any goal
- Unrealistic suggestions
- Being overly technical or financial jargon
- Negative or discouraging language`;

    const userContext = `
Goal: ${potName}
Current saved: $${currentAmount.toFixed(2)}
Target amount: $${targetAmount.toFixed(2)}
Progress: ${progress.toFixed(1)}%
Amount remaining: $${remaining.toFixed(2)}
Days saving: ${daysSinceCreation}
${notes ? `Notes: ${notes}` : ''}
${currentPace > 0 ? `Current daily pace: $${currentPace.toFixed(2)}` : ''}
`;

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContext }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      // Return a generic motivational tip as fallback
      return new Response(
        JSON.stringify({ 
          tip: `You're ${progress.toFixed(0)}% of the way to your ${potName}! Keep up the great momentum and you'll reach your goal soon. Every little bit counts!`
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const aiResponse = await response.json();
    const tip = aiResponse.choices?.[0]?.message?.content;
    
    if (!tip) {
      throw new Error('No response from AI');
    }

    return new Response(
      JSON.stringify({ tip: tip.trim() }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error generating coaching tip:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        tip: 'Keep pushing toward your goal! Consistency is the key to success. Every contribution brings you closer!'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
