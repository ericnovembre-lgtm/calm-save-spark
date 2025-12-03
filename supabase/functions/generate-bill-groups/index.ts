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
    const { bills } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a financial categorization expert. Analyze bills and create smart groups with brief explanations. Return ONLY valid JSON in this exact format:
{
  "groups": [
    {
      "id": "unique-id",
      "name": "Group Name",
      "description": "Brief explanation (max 15 words)",
      "billIds": ["id1", "id2"],
      "totalAmount": 100.50,
      "confidence": 85
    }
  ]
}`;

    const userPrompt = `Analyze these bills and create 3-4 smart groups:
${JSON.stringify(bills, null, 2)}

Create groups like:
- "Negotiable Bills" (services with high savings potential)
- "Zombie Subscriptions" (unused services based on patterns)
- "Critical Bills" (utilities, rent - cannot be late)
- "Variable Costs" (bills that fluctuate)

Each group needs: name, description, billIds array, totalAmount, confidence (0-100).`;

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
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const groups = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(groups), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-bill-groups:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, groups: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
