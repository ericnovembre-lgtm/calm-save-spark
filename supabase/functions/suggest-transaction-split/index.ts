import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { merchant, amount, description, category } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a transaction splitting expert. Analyze the transaction and suggest how to split it.

Consider:
- Transaction type: Dining/groceries often split equally, rent by percentage, utilities custom
- Amount: Small amounts ($10-50) = 2-3 people, medium ($50-200) = 2-5 people, large = roommates
- Description patterns: "lunch with John" = 2 people equal, "groceries for the house" = 3-4 equal
- Category context: "Dining" = equal, "Rent" = percentage, "Utilities" = custom

Return JSON with:
{
  "suggestedSplitType": "equal" | "percentage" | "custom",
  "suggestedPersonCount": number,
  "suggestedSplits": [
    { "name": "You", "amount": number, "percentage": number },
    { "name": "Person 2", "amount": number, "percentage": number }
  ],
  "reasoning": "Brief explanation of suggestion"
}`;

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
            content: `Suggest split for:
Merchant: ${merchant}
Amount: $${amount}
Description: ${description || 'N/A'}
Category: ${category}`,
          },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'suggest_split',
            description: 'Return split suggestion',
            parameters: {
              type: 'object',
              properties: {
                suggestedSplitType: {
                  type: 'string',
                  enum: ['equal', 'percentage', 'custom']
                },
                suggestedPersonCount: { type: 'number' },
                suggestedSplits: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      amount: { type: 'number' },
                      percentage: { type: 'number' }
                    },
                    required: ['name', 'amount', 'percentage']
                  }
                },
                reasoning: { type: 'string' }
              },
              required: ['suggestedSplitType', 'suggestedPersonCount', 'suggestedSplits', 'reasoning']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_split' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const suggestion = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(suggestion), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error suggesting split:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
