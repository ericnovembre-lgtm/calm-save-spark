import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { portfolioData } = await req.json();

    console.log('Generating hedge fund-style rebalancing recommendation');

    // Calculate portfolio concentration metrics
    const holdings = portfolioData.holdings || [];
    const totalValue = holdings.reduce((sum: number, h: any) => sum + h.value, 0);
    
    const holdingsByValue = holdings
      .map((h: any) => ({
        symbol: h.symbol,
        value: h.value,
        percentage: (h.value / totalValue) * 100,
      }))
      .sort((a: any, b: any) => b.percentage - a.percentage);

    const maxSingleAsset = holdingsByValue[0];
    const top3Concentration = holdingsByValue.slice(0, 3).reduce((sum: any, h: any) => sum + h.percentage, 0);
    
    // Calculate Herfindahl Index for diversification
    const herfindahlIndex = holdingsByValue.reduce((sum: any, h: any) => sum + Math.pow(h.percentage, 2), 0);

    // Define target allocation (60% stocks, 40% bonds/cash)
    const targetAllocation = {
      VTI: 60,
      BND: 40,
    };

    // Calculate current allocation
    const currentAllocation: Record<string, number> = {};
    holdings.forEach((h: any) => {
      currentAllocation[h.symbol] = (h.value / totalValue) * 100;
    });

    // Calculate drift
    let totalDrift = 0;
    Object.keys(targetAllocation).forEach(key => {
      const target = targetAllocation[key as keyof typeof targetAllocation];
      const current = currentAllocation[key] || 0;
      totalDrift += Math.abs(target - current);
    });
    const drift = totalDrift / 2;

    // Generate AI narrative
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are Ray Dalio's AI counterpart—a hedge fund manager with expertise in portfolio construction and risk management.

Your role: Generate a PERSUASIVE, DATA-DRIVEN argument for why the user should rebalance.

Writing Style:
- Lead with the most compelling risk (e.g., concentration, sector overweight)
- Use specific numbers and portfolio percentages
- Reference historical data and backtests when relevant
- Paint a vivid picture of downside scenarios
- End with actionable recommendations

Structure (3-4 paragraphs, ~150 words):
1. **Risk Identification**: "Your portfolio shows X% in Y, creating Z risk..."
2. **Evidence**: "Historical analysis suggests... / Backtesting indicates..."
3. **Solution**: "By rebalancing X% from A to B, you would..."
4. **Expected Outcome**: "This adjustment reduces volatility by Y% while maintaining Z% of upside..."`;

    const userPrompt = `Analyze this portfolio and write a persuasive rebalancing argument:

**Current Holdings:**
${JSON.stringify(holdingsByValue, null, 2)}

**Portfolio Metrics:**
- Largest Position: ${maxSingleAsset.symbol} (${maxSingleAsset.percentage.toFixed(1)}%)
- Top 3 Concentration: ${top3Concentration.toFixed(1)}%
- Herfindahl Diversification Index: ${herfindahlIndex.toFixed(1)}
- Total Portfolio Value: $${totalValue.toLocaleString()}

**Target Allocation:**
${JSON.stringify(targetAllocation, null, 2)}

**Current Drift:** ${drift.toFixed(1)}%

Write a compelling 3-4 paragraph argument for rebalancing, then provide specific actions.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "provide_rebalancing_recommendation",
          description: "Provide hedge-fund quality rebalancing analysis",
          parameters: {
            type: "object",
            properties: {
              narrative: {
                type: "string",
                description: "3-4 paragraph persuasive argument (150-200 words)"
              },
              keyRisks: {
                type: "array",
                items: { type: "string" },
                description: "3-5 bullet points of specific risks"
              },
              actions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    action: { type: "string", enum: ["buy", "sell"] },
                    symbol: { type: "string" },
                    amount: { type: "number" },
                    reason: { type: "string" }
                  }
                }
              },
              expectedImpact: {
                type: "object",
                properties: {
                  volatilityReduction: { type: "number" },
                  diversificationScore: { type: "number" },
                  riskAdjustedReturn: { type: "number" }
                }
              }
            },
            required: ["narrative", "keyRisks", "actions", "expectedImpact"]
          }
        }
      }
    ];

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
        tools,
        tool_choice: { type: "function", function: { name: "provide_rebalancing_recommendation" } },
        max_completion_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('Failed to generate rebalancing recommendation');
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const recommendation = JSON.parse(toolCall.function.arguments);

    // Save to database
    const { error: insertError } = await supabaseClient
      .from('rebalancing_suggestions')
      .insert({
        user_id: user.id,
        suggestion_data: {
          narrative: recommendation.narrative,
          keyRisks: recommendation.keyRisks,
          suggestions: recommendation.actions,
          expectedImpact: recommendation.expectedImpact,
          currentDrift: drift,
          targetAllocation,
          currentAllocation,
          portfolioMetrics: {
            maxSingleAsset,
            top3Concentration,
            herfindahlIndex,
          }
        },
        status: 'pending'
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify(recommendation),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in hedge-fund-rebalancer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
