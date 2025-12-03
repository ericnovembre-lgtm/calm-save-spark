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
    const { goalInput } = await req.json();
    
    if (!goalInput || typeof goalInput !== 'string') {
      throw new Error('Invalid goal input');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating goal preview for:', goalInput);

    // Call Lovable AI to generate goal data
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
            content: `You are a financial goal estimator. Given a user's savings goal description, estimate:
1. A realistic target amount in USD
2. A reasonable timeline (e.g., "6 months", "2 years")
3. Choose a gradient background color theme that matches the goal

Respond with valid JSON only, no markdown:
{
  "name": "goal name",
  "targetAmount": number,
  "timeline": "X months/years",
  "backgroundImage": "linear-gradient(135deg, hsl(...) 0%, hsl(...) 100%)"
}

Common goal amounts:
- Emergency fund: $5,000-$10,000
- Trip to Tokyo: $3,000-$5,000
- House down payment: $30,000-$50,000
- New car: $20,000-$35,000
- Wedding: $15,000-$30,000
- College tuition: $20,000-$50,000

Color themes:
- Travel: blue/teal gradients
- Home: green/earth tones
- Vehicle: red/orange
- Education: purple/blue
- Emergency: orange/yellow
- Wedding: pink/purple`,
          },
          {
            role: 'user',
            content: `Generate savings goal data for: "${goalInput}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content from AI');
    }

    // Parse AI response
    let goalData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      goalData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Content:', content);
      // Fallback
      goalData = {
        name: goalInput,
        targetAmount: 5000,
        timeline: '12 months',
        backgroundImage: 'linear-gradient(135deg, hsl(280 100% 70%) 0%, hsl(200 100% 70%) 100%)',
      };
    }

    console.log('Generated goal data:', goalData);

    return new Response(JSON.stringify(goalData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-goal-preview:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
