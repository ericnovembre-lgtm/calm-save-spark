// Monte Carlo AI Explanation using Deepseek Reasoner
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callDeepseek, estimateDeepseekCost } from "../_shared/deepseek-client.ts";

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      simulationMetadata,
      timeline,
      percentiles,
      lifeEvents = [],
      currentState
    } = await req.json();

    if (!simulationMetadata || !percentiles) {
      return new Response(
        JSON.stringify({ error: 'Missing simulation data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Monte Carlo Explain] Analyzing simulation with Deepseek Reasoner');

    const systemPrompt = `You are a financial simulation expert. Analyze Monte Carlo simulation results and provide clear, actionable insights.

Your analysis should:
1. Explain what the percentile bands mean in plain English
2. Identify which parameters have the most impact on outcomes
3. Highlight controllable vs uncontrollable factors
4. Provide specific, actionable recommendations
5. Translate statistical concepts into understandable terms

Return your analysis as JSON:
{
  "sensitivity_analysis": [
    { "parameter": "<name>", "impact_score": <1-10>, "explanation": "<why this matters>" }
  ],
  "risk_narrative": "<plain English explanation of the probability cones - what p10/p50/p90 mean for THIS person>",
  "control_factors": [
    { "factor": "<what they can control>", "impact": "high" | "medium" | "low", "recommendation": "<specific action>" }
  ],
  "uncontrollable_factors": [
    { "factor": "<market/external factor>", "mitigation": "<how to reduce exposure>" }
  ],
  "confidence_explanation": "<what the confidence intervals tell us about certainty>",
  "key_insight": "<the single most important takeaway>",
  "scenario_risks": [
    { "scenario": "<what could go wrong>", "probability": "<likelihood>", "impact": "<severity>", "mitigation": "<what to do>" }
  ],
  "milestone_projections": [
    { "milestone": "<e.g., $500K net worth>", "median_year": <year>, "range": "<p10-p90 year range>" }
  ]
}`;

    const userPrompt = `Analyze this Monte Carlo financial simulation:

SIMULATION METADATA:
- Total runs: ${simulationMetadata.simulations}
- Success probability: ${simulationMetadata.successProbability?.toFixed(1)}%
- Time horizon: ${timeline?.length || 30} years

CURRENT FINANCIAL STATE:
${JSON.stringify(currentState, null, 2)}

PERCENTILE OUTCOMES (Final Net Worth):
- 10th percentile (pessimistic): $${percentiles.p10?.toLocaleString()}
- 50th percentile (median): $${percentiles.p50?.toLocaleString()}
- 90th percentile (optimistic): $${percentiles.p90?.toLocaleString()}

LIFE EVENTS MODELED:
${lifeEvents.length > 0 ? lifeEvents.map((e: any) => `- ${e.type}: Year ${e.year}, Impact: $${e.impact}`).join('\n') : 'None'}

TIMELINE PROGRESSION (key years):
${timeline?.slice(0, 10).map((t: any) => `Year ${t.year}: Median $${t.median?.toLocaleString()}, Range: $${t.p10?.toLocaleString()} - $${t.p90?.toLocaleString()}`).join('\n') || 'Not available'}

Provide your analysis with actionable insights.`;

    const startTime = Date.now();
    const response = await callDeepseek([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { maxTokens: 3000, temperature: 0.2 });

    const responseTime = Date.now() - startTime;
    console.log('[Monte Carlo Explain] Deepseek response time:', responseTime, 'ms');

    const content = response.choices[0].message.content;
    const reasoningContent = response.choices[0].message.reasoning_content;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Add metadata
    analysis.reasoning_chain = reasoningContent || null;
    analysis.model = 'deepseek-reasoner';
    analysis.response_time_ms = responseTime;

    // Log cost
    const cost = estimateDeepseekCost(
      response.usage.prompt_tokens,
      response.usage.completion_tokens,
      response.usage.reasoning_tokens || 0
    );
    console.log('[Monte Carlo Explain] Deepseek cost:', `$${cost.toFixed(4)}`);

    // Log analytics
    try {
      await supabaseClient.from('ai_model_routing_analytics').insert({
        user_id: user.id,
        query_type: 'mathematical_reasoning',
        model_used: 'deepseek-reasoner',
        response_time_ms: responseTime,
        token_count: response.usage.total_tokens,
        estimated_cost: cost
      });
    } catch (logError) {
      console.warn('Failed to log analytics:', logError);
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in monte-carlo-explain:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
