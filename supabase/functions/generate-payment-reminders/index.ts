import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { upcomingBills, userBalance } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a helpful payment reminder assistant. Generate personalized, friendly reminders about upcoming bills. Return ONLY valid JSON:
{
  "reminders": [
    {
      "type": "upcoming_due|optimization|savings|zombie_alert",
      "title": "Brief title (max 10 words)",
      "message": "Friendly message (max 25 words)",
      "priority": "low|medium|high",
      "icon": "emoji",
      "actions": ["Action 1", "Action 2"]
    }
  ]
}`;

    const userPrompt = `Generate 3-4 personalized payment reminders for these upcoming bills:
${JSON.stringify(upcomingBills, null, 2)}

User's current balance: $${userBalance}

Create reminders for:
1. Upcoming due dates (3-7 days away)
2. Optimization tips (payment timing suggestions)
3. Savings opportunities (negotiable bills)
4. Zombie alerts (unused services)

Keep messages friendly and actionable. Return JSON only.`;

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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-payment-reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, reminders: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
