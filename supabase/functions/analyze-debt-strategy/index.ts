// Edge function to analyze debt strategy using Deepseek Reasoner for mathematical reasoning
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { debts, avalancheSummary, snowballSummary, currentStrategy, extraPayment = 0 } = await req.json();

    if (!debts || !avalancheSummary || !snowballSummary) {
      return new Response(
        JSON.stringify({ error: 'Missing required debt data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    console.log('[Analyze Debt Strategy] Using Deepseek Reasoner for mathematical analysis');

    const systemPrompt = `You are a financial mathematics expert specializing in debt optimization.
Your task is to analyze a debt portfolio and provide mathematically-proven recommendations.

Key analysis requirements:
1. Calculate exact interest savings between strategies
2. Identify the mathematically optimal approach
3. Consider psychological factors (quick wins vs. pure math)
4. Provide specific debt prioritization
5. Calculate breakeven points for extra payments

Return your analysis as JSON with this exact structure:
{
  "recommended_strategy": "avalanche" | "snowball" | "hybrid",
  "insight_message": "Concise personalized insight (max 60 words)",
  "savings_amount": <dollar amount saved with optimal strategy>,
  "time_difference_months": <months saved vs alternative>,
  "highlighted_debt": "<name of priority debt>",
  "urgency_level": "low" | "medium" | "high",
  "optimal_payment_allocation": [
    { "debt_name": "<name>", "recommended_extra_payment": <amount>, "mathematical_reasoning": "<brief explanation>" }
  ],
  "interest_rate_vs_balance_tradeoff": "<analysis of avalanche vs snowball for this portfolio>",
  "psychological_factor_score": <0-100>,
  "breakeven_extra_payment": <amount where switching strategies matters>
}`;

    const debtDetails = debts.map((d: any) => 
      `- ${d.debt_name}: $${d.current_balance} @ ${d.interest_rate}% APR, min payment: $${d.minimum_payment || 0} (${d.debt_type})`
    ).join('\n');

    const userPrompt = `Analyze this debt portfolio with mathematical precision:

DEBT PORTFOLIO:
${debtDetails}

SIMULATION RESULTS:
Avalanche Method (highest interest first):
- Time to payoff: ${avalancheSummary.months_to_payoff} months (${avalancheSummary.years_to_payoff} years)
- Total interest: $${avalancheSummary.total_interest_paid}
- Total paid: $${avalancheSummary.total_paid}

Snowball Method (smallest balance first):
- Time to payoff: ${snowballSummary.months_to_payoff} months (${snowballSummary.years_to_payoff} years)
- Total interest: $${snowballSummary.total_interest_paid}
- Total paid: $${snowballSummary.total_paid}

Current Strategy: ${currentStrategy}
Available Extra Payment: $${extraPayment}/month

Provide your mathematically-proven analysis.`;

    const startTime = Date.now();
    const response = await callDeepseek([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { maxTokens: 2048, temperature: 0.1 });

    const responseTime = Date.now() - startTime;
    console.log('[Analyze Debt Strategy] Deepseek response time:', responseTime, 'ms');

    const content = response.choices[0].message.content;
    const reasoningContent = response.choices[0].message.reasoning_content;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Add reasoning chain if available
    if (reasoningContent) {
      analysis.reasoning_chain = reasoningContent;
    }

    // Log cost
    const cost = estimateDeepseekCost(
      response.usage.prompt_tokens,
      response.usage.completion_tokens,
      response.usage.reasoning_tokens || 0
    );
    console.log('[Analyze Debt Strategy] Deepseek cost:', `$${cost.toFixed(4)}`);

    // Add model attribution
    analysis.model = 'deepseek-reasoner';
    analysis.response_time_ms = responseTime;

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-debt-strategy:', error);
    
    // Fallback to basic analysis if Deepseek fails
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
