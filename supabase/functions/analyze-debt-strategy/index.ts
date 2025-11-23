// Edge function to analyze debt strategy using AI
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
    const { debts, avalancheSummary, snowballSummary, currentStrategy } = await req.json();

    if (!debts || !avalancheSummary || !snowballSummary) {
      return new Response(
        JSON.stringify({ error: 'Missing required debt data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a financial strategy analyst helping users optimize their debt payoff strategy.

Analyze the user's specific debt portfolio and simulation results to provide personalized, actionable insights.

Your insight should:
- Be concise (under 50 words)
- Identify which strategy is optimal and why
- Call out specific debts by name when relevant
- Mention exact dollar savings
- Be motivating and encouraging
- Use urgency when significant savings are possible

Focus on what makes THEIR situation unique, not generic advice.`;

    const debtDetails = debts.map((d: any) => 
      `- ${d.debt_name}: $${d.current_balance} @ ${d.interest_rate}% APR (${d.debt_type})`
    ).join('\n');

    const userPrompt = `Analyze this debt portfolio and provide a personalized strategy insight:

DEBT PORTFOLIO:
${debtDetails}

SIMULATION RESULTS:
Avalanche Method:
- Time to payoff: ${avalancheSummary.months_to_payoff} months (${avalancheSummary.years_to_payoff} years)
- Total interest: $${avalancheSummary.total_interest_paid}
- Total paid: $${avalancheSummary.total_paid}

Snowball Method:
- Time to payoff: ${snowballSummary.months_to_payoff} months (${snowballSummary.years_to_payoff} years)
- Total interest: $${snowballSummary.total_interest_paid}
- Total paid: $${snowballSummary.total_paid}

Current Strategy: ${currentStrategy}

Generate a concise, personalized insight that explains which strategy is better for this specific portfolio and why.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_strategy",
            description: "Analyze debt repayment strategy and provide personalized insight",
            parameters: {
              type: "object",
              properties: {
                recommended_strategy: { 
                  type: "string", 
                  enum: ["avalanche", "snowball", "equal"],
                  description: "Which strategy is optimal"
                },
                insight_message: { 
                  type: "string", 
                  description: "Personalized insight message (max 50 words)"
                },
                savings_amount: { 
                  type: "number", 
                  description: "Dollar amount saved with optimal strategy"
                },
                time_difference_months: {
                  type: "number",
                  description: "Months difference between strategies"
                },
                highlighted_debt: {
                  type: "string",
                  description: "Name of the debt to focus on (if applicable)"
                },
                urgency_level: {
                  type: "string",
                  enum: ["low", "medium", "high"],
                  description: "How urgently they should consider switching"
                }
              },
              required: ["recommended_strategy", "insight_message", "savings_amount"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_strategy" } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please upgrade or try later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('AI error:', aiResponse.status, await aiResponse.text());
      throw new Error('Failed to analyze debt strategy');
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-debt-strategy:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
