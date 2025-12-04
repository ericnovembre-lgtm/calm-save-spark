import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callDeepseekWithAdaptiveLimit } from "../_shared/adaptive-deepseek-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BudgetCategory {
  name: string;
  currentBudget: number;
  actualSpend: number;
  isEssential: boolean;
}

interface OptimizationRequest {
  monthlyIncome: number;
  currentBudgets: BudgetCategory[];
  savingsGoal: number;
  debtPayments: number;
  optimizationType: 'zero_based' | 'category_optimization' | 'adaptive_reallocation';
  spendingHistory?: { category: string; amount: number; month: string }[];
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

    const input: OptimizationRequest = await req.json();
    console.log("[optimize-budget-zbb] Request:", { userId: user.id, type: input.optimizationType });

    // Calculate current totals
    const totalCurrentBudget = input.currentBudgets.reduce((sum, b) => sum + b.currentBudget, 0);
    const totalActualSpend = input.currentBudgets.reduce((sum, b) => sum + b.actualSpend, 0);
    const currentSavingsRate = ((input.monthlyIncome - totalActualSpend - input.debtPayments) / input.monthlyIncome) * 100;

    // Build Deepseek prompt
    const systemPrompt = `You are an expert budget optimization AI specializing in zero-based budgeting and category spending optimization. Provide precise financial recommendations with step-by-step reasoning.

Always respond with valid JSON in this exact format:
{
  "zeroBased Budget": {
    "allocations": [
      {
        "category": "<string>",
        "amount": <number>,
        "percentage": <number>,
        "priority": <1-10>,
        "rationale": "<string>",
        "isEssential": <boolean>
      }
    ],
    "totalAllocated": <number>,
    "savingsAllocation": <number>,
    "debtAllocation": <number>
  },
  "categoryOptimizations": [
    {
      "category": "<string>",
      "currentSpend": <number>,
      "suggestedBudget": <number>,
      "savingsOpportunity": <number>,
      "difficulty": "<easy|medium|hard>",
      "tactics": ["<specific action>"],
      "benchmark": "<comparison to typical spending>"
    }
  ],
  "reallocationSuggestions": [
    {
      "from": "<category>",
      "to": "<category>",
      "amount": <number>,
      "reason": "<string>",
      "urgency": "<low|medium|high>"
    }
  ],
  "savingsProjection": {
    "currentRate": <percentage>,
    "optimizedRate": <percentage>,
    "monthlyIncrease": <amount>,
    "annualImpact": <amount>
  },
  "quickWins": [
    {"action": "<string>", "savings": <amount>, "effort": "<low|medium|high>"}
  ],
  "longTermChanges": [
    {"action": "<string>", "savings": <amount>, "timeframe": "<string>"}
  ],
  "reasoning": "<detailed step-by-step mathematical reasoning>"
}`;

    const userPrompt = `Optimize this budget using ${input.optimizationType === 'zero_based' ? 'zero-based budgeting' : input.optimizationType === 'category_optimization' ? 'category optimization' : 'adaptive reallocation'}:

## Financial Overview
- Monthly Income: $${input.monthlyIncome.toLocaleString()}
- Current Total Budget: $${totalCurrentBudget.toLocaleString()}
- Actual Total Spend: $${totalActualSpend.toLocaleString()}
- Debt Payments: $${input.debtPayments.toLocaleString()}
- Current Savings Rate: ${currentSavingsRate.toFixed(1)}%
- Target Savings Goal: $${input.savingsGoal.toLocaleString()}/month

## Current Budget Categories
${input.currentBudgets.map(b => `- ${b.name}: Budget $${b.currentBudget} | Actual $${b.actualSpend} | ${b.isEssential ? 'Essential' : 'Discretionary'} | Variance: $${(b.currentBudget - b.actualSpend).toFixed(2)}`).join('\n')}

${input.spendingHistory ? `## Recent Spending History (Last 3 Months)
${JSON.stringify(input.spendingHistory, null, 2)}` : ''}

## Optimization Requirements
${input.optimizationType === 'zero_based' ? `
1. Start from $0 and justify every dollar allocation
2. Apply 50/30/20 rule as baseline (needs 50%, wants 30%, savings 20%)
3. Prioritize by essential vs discretionary
4. Ensure debt payments and savings goals are met first
` : input.optimizationType === 'category_optimization' ? `
1. Identify overspending categories
2. Find specific reduction opportunities
3. Benchmark against typical spending patterns
4. Provide actionable tactics for each category
` : `
1. Identify surplus categories (under-spending)
2. Identify deficit categories (over-spending)
3. Suggest smart reallocations
4. Account for seasonal patterns
`}

## Constraints
- All essential categories must be funded
- Minimum emergency fund contribution of $100/month
- Debt payments are fixed at $${input.debtPayments}

Show all mathematical calculations in your reasoning.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const response = await callDeepseekWithAdaptiveLimit(messages, { maxTokens: 4096, temperature: 0.1 }, supabase);
    
    const content = response.choices[0]?.message?.content || '{}';
    const reasoningContent = response.choices[0]?.message?.reasoning_content || '';

    // Parse the response
    let optimizationResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimizationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("[optimize-budget-zbb] Parse error:", parseError);
      // Return structured fallback based on 50/30/20 rule
      const needs = input.monthlyIncome * 0.5;
      const wants = input.monthlyIncome * 0.3;
      const savings = input.monthlyIncome * 0.2;

      optimizationResult = {
        zeroBasedBudget: {
          allocations: input.currentBudgets.map((b, i) => ({
            category: b.name,
            amount: b.isEssential ? (needs / input.currentBudgets.filter(c => c.isEssential).length) : (wants / input.currentBudgets.filter(c => !c.isEssential).length),
            percentage: ((b.isEssential ? needs : wants) / input.monthlyIncome) * 100 / input.currentBudgets.filter(c => c.isEssential === b.isEssential).length,
            priority: b.isEssential ? i + 1 : i + 5,
            rationale: b.isEssential ? "Essential expense" : "Discretionary spending",
            isEssential: b.isEssential,
          })),
          totalAllocated: needs + wants,
          savingsAllocation: savings,
          debtAllocation: input.debtPayments,
        },
        categoryOptimizations: input.currentBudgets
          .filter(b => b.actualSpend > b.currentBudget)
          .map(b => ({
            category: b.name,
            currentSpend: b.actualSpend,
            suggestedBudget: b.currentBudget,
            savingsOpportunity: b.actualSpend - b.currentBudget,
            difficulty: b.isEssential ? "hard" : "medium",
            tactics: ["Review spending patterns", "Set spending alerts"],
            benchmark: "Typical range",
          })),
        reallocationSuggestions: [],
        savingsProjection: {
          currentRate: currentSavingsRate,
          optimizedRate: 20,
          monthlyIncrease: (input.monthlyIncome * 0.2) - (input.monthlyIncome - totalActualSpend - input.debtPayments),
          annualImpact: ((input.monthlyIncome * 0.2) - (input.monthlyIncome - totalActualSpend - input.debtPayments)) * 12,
        },
        quickWins: [
          { action: "Review subscriptions", savings: 50, effort: "low" },
          { action: "Meal planning", savings: 150, effort: "medium" },
        ],
        longTermChanges: [
          { action: "Negotiate bills", savings: 100, timeframe: "1-2 months" },
        ],
        reasoning: content,
      };
    }

    // Add chain-of-thought reasoning
    if (reasoningContent) {
      optimizationResult.chainOfThought = reasoningContent;
    }

    // Store optimization in history
    await supabase.from('budget_optimization_history').insert({
      user_id: user.id,
      optimization_type: input.optimizationType,
      input_data: {
        monthlyIncome: input.monthlyIncome,
        currentBudgets: input.currentBudgets,
        savingsGoal: input.savingsGoal,
        debtPayments: input.debtPayments,
      },
      recommendations: optimizationResult,
      reasoning_chain: { reasoning: optimizationResult.reasoning, chainOfThought: reasoningContent },
      savings_potential: optimizationResult.savingsProjection?.monthlyIncrease || 0,
    });

    // Log analytics
    await supabase.from('ai_model_routing_analytics').insert({
      user_id: user.id,
      model_used: 'deepseek-reasoner',
      query_type: 'budget_optimization',
      token_count: response.usage?.total_tokens || 0,
      reasoning_tokens: response.usage?.reasoning_tokens || 0,
    });

    console.log("[optimize-budget-zbb] Success, tokens:", response.usage?.total_tokens);

    return new Response(JSON.stringify(optimizationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[optimize-budget-zbb] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Budget optimization failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
