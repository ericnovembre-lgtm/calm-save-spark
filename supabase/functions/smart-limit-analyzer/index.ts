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
    const { accountId } = await req.json();

    // For MVP, use reasonable defaults
    // In production, would fetch user profile and transaction data
    const estimatedMonthlyIncome = 3000;
    const estimatedDailySpend = 40;

    // Use AI to analyze and suggest safe harbor limit
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor specializing in credit card spending limits. Analyze user data and suggest a daily spending limit that keeps them debt-free while allowing flexibility.'
          },
          {
            role: 'user',
            content: `Monthly income: $${estimatedMonthlyIncome}
Average daily spending: $${estimatedDailySpend.toFixed(2)}

Suggest a "Safe Harbor" daily spending limit and explain why in 2-3 sentences.
Return as JSON: { suggestedLimit: number, reason: string }`
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      console.error('AI Gateway error:', await aiResponse.text());
      // Fallback calculation
      const fallbackLimit = Math.max(800, Math.round(estimatedMonthlyIncome * 0.4 / 30));
      return new Response(
        JSON.stringify({
          suggestedLimit: fallbackLimit,
          reason: `Based on typical income patterns, $${fallbackLimit}/day allows 40% of monthly income for discretionary spending.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiResult = aiData.choices[0].message.content;

    // Parse JSON response
    let result;
    try {
      const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      // Fallback if parsing fails
      const fallbackLimit = Math.max(800, Math.round(estimatedMonthlyIncome * 0.4 / 30));
      result = {
        suggestedLimit: fallbackLimit,
        reason: `Based on your spending patterns, $${fallbackLimit}/day keeps you financially stable.`
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Smart limit analyzer error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});