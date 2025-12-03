import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { portfolioData, scenario } = await req.json();

    if (!scenario || !portfolioData) {
      throw new Error('Missing required parameters: scenario and portfolioData');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context about the portfolio
    const totalValue = portfolioData.reduce((sum: number, asset: any) => sum + asset.value, 0);
    const assetBreakdown = portfolioData.map((asset: any) => ({
      name: asset.name,
      value: asset.value,
      percentage: ((asset.value / totalValue) * 100).toFixed(1)
    }));

    const systemPrompt = `You are a portfolio risk analyst. Analyze how a specific macroeconomic scenario would impact a user's investment portfolio.

Portfolio Composition (Total Value: $${totalValue.toLocaleString()}):
${assetBreakdown.map((a: any) => `- ${a.name}: $${a.value.toLocaleString()} (${a.percentage}%)`).join('\n')}

Provide your analysis in the following JSON structure:
{
  "overallImpact": "Description of the portfolio-wide effect",
  "estimatedImpactRange": { "min": -15, "max": -8 },
  "affectedAssets": [
    {
      "assetClass": "Asset class name",
      "impact": "positive|negative|neutral",
      "severity": "severe|significant|moderate|minimal",
      "explanation": "Why this asset class is affected"
    }
  ],
  "defensiveActions": [
    {
      "action": "Specific actionable recommendation",
      "priority": "high|medium|low",
      "rationale": "Why this helps"
    }
  ],
  "historicalContext": "Brief historical precedent for similar events",
  "confidenceLevel": "high|medium|low"
}`;

    const userPrompt = `Scenario: "${scenario}"

Analyze the potential impact on this portfolio and provide defensive recommendations.`;

    console.log('[Scenario Simulator] Requesting AI analysis for:', scenario);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[Scenario Simulator] AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    console.log('[Scenario Simulator] Raw AI response:', content);

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    console.log('[Scenario Simulator] Analysis complete');

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Scenario Simulator] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        overallImpact: 'Unable to analyze scenario at this time',
        affectedAssets: [],
        defensiveActions: [],
        confidenceLevel: 'low'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
