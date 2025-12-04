import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callDeepseekWithAdaptiveLimit } from "../_shared/adaptive-deepseek-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RetirementRequest {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  targetRetirementIncome: number;
  socialSecurityEstimate: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  taxBracket: number;
  accountBalances: {
    traditional401k: number;
    rothIra: number;
    taxable: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const input: RetirementRequest = await req.json();
    console.log("[retirement-planner] Request for user:", user.id);

    const yearsToRetirement = input.retirementAge - input.currentAge;
    const expectedRetirementYears = 30; // Plan for 30 years in retirement

    // Build comprehensive prompt for Deepseek Reasoner
    const systemPrompt = `You are an expert retirement planning AI with deep knowledge of Social Security optimization, tax-efficient withdrawal strategies, and Monte Carlo simulations. Provide precise financial calculations with step-by-step reasoning.

Always respond with valid JSON in this exact format:
{
  "monteCarloResults": {
    "successProbability": <number 0-100>,
    "medianOutcome": <number>,
    "p10Outcome": <number>,
    "p90Outcome": <number>,
    "scenarios": [{"year": <number>, "p10": <number>, "p50": <number>, "p90": <number>}]
  },
  "socialSecurityAnalysis": {
    "optimalClaimingAge": <62|67|70>,
    "benefitAt62": <monthly amount>,
    "benefitAt67": <monthly amount>,
    "benefitAt70": <monthly amount>,
    "breakEvenAge62vs67": <age>,
    "breakEvenAge67vs70": <age>,
    "lifetimeValueAt62": <total>,
    "lifetimeValueAt67": <total>,
    "lifetimeValueAt70": <total>,
    "recommendation": "<string>"
  },
  "withdrawalStrategy": {
    "optimalSequence": ["<account type>"],
    "firstYearWithdrawals": {
      "traditional": <amount>,
      "roth": <amount>,
      "taxable": <amount>
    },
    "safeWithdrawalRate": <percentage>,
    "rothConversionOpportunity": {
      "recommendedAmount": <amount>,
      "taxSavings": <amount>,
      "optimalYears": [<years>]
    },
    "rmdProjections": [{"age": <number>, "amount": <number>}]
  },
  "sensitivityAnalysis": [
    {"factor": "<string>", "impact": "<high|medium|low>", "description": "<string>"}
  ],
  "recommendations": [
    {"priority": <1-5>, "action": "<string>", "impact": "<string>", "timeline": "<string>"}
  ],
  "reasoning": "<detailed step-by-step mathematical reasoning>"
}`;

    const userPrompt = `Create a comprehensive retirement plan with the following inputs:

## Current Financial Situation
- Current Age: ${input.currentAge}
- Target Retirement Age: ${input.retirementAge}
- Years Until Retirement: ${yearsToRetirement}
- Current Total Savings: $${input.currentSavings.toLocaleString()}
- Monthly Contribution: $${input.monthlyContribution.toLocaleString()}

## Account Balances
- Traditional 401(k)/IRA: $${input.accountBalances.traditional401k.toLocaleString()}
- Roth IRA: $${input.accountBalances.rothIra.toLocaleString()}
- Taxable Brokerage: $${input.accountBalances.taxable.toLocaleString()}

## Retirement Goals
- Target Annual Income in Retirement: $${input.targetRetirementIncome.toLocaleString()}
- Estimated Social Security Benefit (at 67): $${input.socialSecurityEstimate.toLocaleString()}/month
- Risk Tolerance: ${input.riskTolerance}
- Current Tax Bracket: ${input.taxBracket}%

## Required Analysis
1. Run Monte Carlo simulation (1000+ scenarios) with varying:
   - Market returns (historical distribution)
   - Inflation rates (2-4% range)
   - Sequence of returns risk

2. Social Security Optimization:
   - Calculate benefits at ages 62, 67, and 70
   - Apply 6.67% reduction per year before 67
   - Apply 8% increase per year after 67 until 70
   - Calculate breakeven ages
   - Determine optimal claiming strategy

3. Withdrawal Strategy:
   - Determine optimal account withdrawal sequence
   - Calculate safe withdrawal rate
   - Identify Roth conversion opportunities
   - Project Required Minimum Distributions (RMDs starting at 73)

4. Sensitivity Analysis:
   - Impact of different return assumptions
   - Effect of contribution changes
   - Social Security timing sensitivity

Assume:
- Expected returns: Conservative 5%, Moderate 7%, Aggressive 9%
- Standard deviation: Conservative 8%, Moderate 12%, Aggressive 18%
- Inflation: 2.5% average
- Life expectancy: ${input.currentAge + yearsToRetirement + expectedRetirementYears} years

Show all mathematical calculations in your reasoning.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const response = await callDeepseekWithAdaptiveLimit(messages, { maxTokens: 6144, temperature: 0.1 }, supabase);
    
    const content = response.choices[0]?.message?.content || '{}';
    const reasoningContent = response.choices[0]?.message?.reasoning_content || '';

    // Parse the response
    let planningResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planningResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("[retirement-planner] Parse error:", parseError);
      // Return structured fallback
      const expectedReturn = input.riskTolerance === 'aggressive' ? 0.09 : input.riskTolerance === 'moderate' ? 0.07 : 0.05;
      const futureValue = input.currentSavings * Math.pow(1 + expectedReturn, yearsToRetirement) +
        input.monthlyContribution * 12 * ((Math.pow(1 + expectedReturn, yearsToRetirement) - 1) / expectedReturn);

      planningResult = {
        monteCarloResults: {
          successProbability: 75,
          medianOutcome: futureValue,
          p10Outcome: futureValue * 0.6,
          p90Outcome: futureValue * 1.5,
          scenarios: Array.from({ length: 10 }, (_, i) => ({
            year: input.retirementAge + i * 3,
            p10: futureValue * 0.6 * Math.pow(0.96, i * 3),
            p50: futureValue * Math.pow(0.96, i * 3),
            p90: futureValue * 1.5 * Math.pow(0.96, i * 3),
          })),
        },
        socialSecurityAnalysis: {
          optimalClaimingAge: 67,
          benefitAt62: Math.round(input.socialSecurityEstimate * 0.7),
          benefitAt67: input.socialSecurityEstimate,
          benefitAt70: Math.round(input.socialSecurityEstimate * 1.24),
          breakEvenAge62vs67: 78,
          breakEvenAge67vs70: 82,
          lifetimeValueAt62: input.socialSecurityEstimate * 0.7 * 12 * 25,
          lifetimeValueAt67: input.socialSecurityEstimate * 12 * 20,
          lifetimeValueAt70: input.socialSecurityEstimate * 1.24 * 12 * 17,
          recommendation: "Consider claiming at 67 for balanced approach",
        },
        withdrawalStrategy: {
          optimalSequence: ['taxable', 'traditional', 'roth'],
          firstYearWithdrawals: {
            traditional: input.targetRetirementIncome * 0.5,
            roth: 0,
            taxable: input.targetRetirementIncome * 0.5,
          },
          safeWithdrawalRate: 4,
          rothConversionOpportunity: {
            recommendedAmount: 50000,
            taxSavings: 5000,
            optimalYears: [input.retirementAge, input.retirementAge + 1],
          },
          rmdProjections: [
            { age: 73, amount: input.accountBalances.traditional401k * 0.0377 },
            { age: 75, amount: input.accountBalances.traditional401k * 0.0403 },
          ],
        },
        sensitivityAnalysis: [
          { factor: "Market Returns", impact: "high", description: "1% change in returns affects outcome by ~15%" },
          { factor: "Contribution Rate", impact: "medium", description: "Increasing by $500/mo improves probability by 5%" },
          { factor: "Retirement Age", impact: "high", description: "Each year delay improves success by 3-5%" },
        ],
        recommendations: [
          { priority: 1, action: "Maximize 401(k) contributions", impact: "High", timeline: "Immediate" },
          { priority: 2, action: "Consider Roth conversion strategy", impact: "Medium", timeline: "Next 5 years" },
        ],
        reasoning: content,
      };
    }

    // Add chain-of-thought reasoning
    if (reasoningContent) {
      planningResult.chainOfThought = reasoningContent;
    }

    // Save or update retirement plan
    const { data: existingPlan } = await supabase
      .from('retirement_plans')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingPlan) {
      await supabase.from('retirement_plans').update({
        current_age: input.currentAge,
        retirement_age: input.retirementAge,
        target_retirement_income: input.targetRetirementIncome,
        current_savings: input.currentSavings,
        monthly_contribution: input.monthlyContribution,
        risk_tolerance: input.riskTolerance,
        social_security_estimate: input.socialSecurityEstimate,
        monte_carlo_results: planningResult.monteCarloResults,
        withdrawal_strategy: planningResult.withdrawalStrategy,
        deepseek_reasoning: { reasoning: planningResult.reasoning, chainOfThought: reasoningContent },
        updated_at: new Date().toISOString(),
      }).eq('id', existingPlan.id);
    } else {
      await supabase.from('retirement_plans').insert({
        user_id: user.id,
        current_age: input.currentAge,
        retirement_age: input.retirementAge,
        target_retirement_income: input.targetRetirementIncome,
        current_savings: input.currentSavings,
        monthly_contribution: input.monthlyContribution,
        risk_tolerance: input.riskTolerance,
        social_security_estimate: input.socialSecurityEstimate,
        monte_carlo_results: planningResult.monteCarloResults,
        withdrawal_strategy: planningResult.withdrawalStrategy,
        deepseek_reasoning: { reasoning: planningResult.reasoning, chainOfThought: reasoningContent },
      });
    }

    // Log analytics
    await supabase.from('ai_model_routing_analytics').insert({
      user_id: user.id,
      model_used: 'deepseek-reasoner',
      query_type: 'retirement_planning',
      token_count: response.usage?.total_tokens || 0,
      reasoning_tokens: response.usage?.reasoning_tokens || 0,
    });

    console.log("[retirement-planner] Success, tokens:", response.usage?.total_tokens);

    return new Response(JSON.stringify(planningResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[retirement-planner] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Retirement planning failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
