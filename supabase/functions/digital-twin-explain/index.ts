import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { scenarioId, context, complexity = 'simple' } = await req.json();

    // Get scenario results
    const { data: scenario } = await supabaseClient
      .from('twin_scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();

    if (!scenario) {
      return new Response(JSON.stringify({ error: 'Scenario not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

    // Determine model based on query complexity
    const isComplexQuery = 
      complexity === 'complex' ||
      (context && context.length > 200) ||
      scenario.success_probability < 50 ||
      Object.keys(scenario.parameters || {}).length > 5;

    let explanation = '';

    if (isComplexQuery && ANTHROPIC_API_KEY) {
      // Use Claude Sonnet 4.5 for complex scenario analysis
      const systemPrompt = `You are a financial scenario analyst specializing in Monte Carlo simulations and retirement planning. 
      Provide deep, nuanced analysis that considers multiple factors and edge cases.
      Be thorough but clear. Use data to support your conclusions.`;

      const userMessage = `Provide a comprehensive analysis of this financial scenario:

**Scenario Details:**
- Success Probability: ${scenario.success_probability}%
- Type: ${scenario.scenario_type}
- Parameters: ${JSON.stringify(scenario.parameters, null, 2)}
- Key Outcomes: ${JSON.stringify(scenario.projected_outcomes?.slice(0, 10) || [])}

**User Context:** ${context || 'User wants deep understanding of their financial future'}

**Analysis Required:**
1. What factors are driving the success probability?
2. What are the primary risks and how likely are they?
3. What specific actions could improve the outcome?
4. How do life events impact the timeline?
5. What market conditions would help or hurt this scenario?

Provide 2-3 paragraphs of actionable insights.`;

      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1024,
          messages: [
            { role: 'user', content: `${systemPrompt}\n\n${userMessage}` }
          ],
        }),
      });

      if (!claudeResponse.ok) {
        console.warn('Claude API failed, falling back to Gemini');
        throw new Error('Claude unavailable');
      }

      const claudeData = await claudeResponse.json();
      explanation = claudeData.content[0]?.text || '';
    }

    // Fallback to Gemini Flash for simple explanations or if Claude fails
    if (!explanation && LOVABLE_API_KEY) {
      const systemPrompt = `You are a financial advisor explaining Monte Carlo simulation results. 
      Provide clear, actionable insights. Be encouraging but realistic. 
      Keep explanations concise and focused.`;

      const userMessage = `Analyze this financial scenario:
      - Success Probability: ${scenario.success_probability}%
      - Scenario Type: ${scenario.scenario_type}
      - Parameters: ${JSON.stringify(scenario.parameters)}
      - Projected Outcomes: ${JSON.stringify(scenario.projected_outcomes?.slice(0, 5))}
      
      Context: ${context || 'User wants to understand their chances of success'}
      
      Provide insights on:
      1. What the success probability means
      2. Key risks or opportunities
      3. One actionable recommendation`;

      const geminiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
      });

      if (!geminiResponse.ok) {
        throw new Error(`AI gateway error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      explanation = geminiData.choices[0]?.message?.content || 'Unable to generate explanation';
    }

    return new Response(
      JSON.stringify({ 
        explanation,
        model_used: isComplexQuery && ANTHROPIC_API_KEY ? 'claude-sonnet-4-5' : 'gemini-3-pro',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in digital-twin-explain:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
