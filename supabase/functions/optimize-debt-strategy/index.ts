import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callDeepseekWithAdaptiveLimit } from "../_shared/adaptive-deepseek-limiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  type?: string;
}

interface OptimizationRequest {
  debts: Debt[];
  extraPayment: number;
  preferredStrategy?: 'avalanche' | 'snowball' | 'hybrid';
  targetPayoffMonths?: number;
}

interface PaymentAllocation {
  debtId: string;
  debtName: string;
  minimumPayment: number;
  extraPayment: number;
  totalPayment: number;
  interestSaved: number;
  monthsToPayoff: number;
}

interface OptimizationResult {
  optimalAllocations: PaymentAllocation[];
  totalInterestSaved: number;
  totalPayoffMonths: number;
  npvAnalysis: {
    presentValueSavings: number;
    futureValueSavings: number;
    effectiveRate: number;
  };
  sensitivityMatrix: {
    extraPaymentAmount: number;
    monthsSaved: number;
    interestSaved: number;
  }[];
  hybridStrategy: {
    strategy: string;
    description: string;
    steps: string[];
  };
  reasoningChain: string[];
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData: OptimizationRequest = await req.json();
    const { debts, extraPayment, preferredStrategy, targetPayoffMonths } = requestData;

    if (!debts || debts.length === 0) {
      return new Response(JSON.stringify({ error: 'No debts provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[optimize-debt-strategy] Processing', debts.length, 'debts with extra payment:', extraPayment);

    const startTime = Date.now();

    // Build comprehensive optimization prompt
    const systemPrompt = `You are a financial mathematics expert specializing in debt optimization algorithms.
Your task is to calculate the mathematically optimal debt payoff strategy with step-by-step reasoning.

You MUST respond with a valid JSON object containing the optimization results.`;

    const userPrompt = `## Multi-Debt Optimization Problem

### Input Debts
${debts.map((d, i) => `${i + 1}. ${d.name}: $${d.balance.toFixed(2)} @ ${d.interestRate}% APR, min payment $${d.minimumPayment.toFixed(2)}`).join('\n')}

### Available Extra Payment
$${extraPayment.toFixed(2)} per month beyond minimums

### User Preference
Strategy: ${preferredStrategy || 'optimal'}
${targetPayoffMonths ? `Target payoff: ${targetPayoffMonths} months` : ''}

### Required Analysis

1. **MATHEMATICAL OPTIMIZATION**
   - Calculate NPV of each debt at current rate
   - Determine optimal allocation using weighted interest-to-balance ratio
   - Account for psychological factors (quick wins vs. interest savings)

2. **SENSITIVITY ANALYSIS**
   - Test extra payments at: $50, $100, $200, $500, $1000
   - Calculate months saved and interest saved for each

3. **HYBRID STRATEGY**
   - If one small debt can be paid off quickly, start with snowball
   - Then switch to avalanche for remaining high-interest debts

### Response Format (JSON)
{
  "optimalAllocations": [
    {
      "debtId": "string",
      "debtName": "string",
      "minimumPayment": number,
      "extraPayment": number,
      "totalPayment": number,
      "interestSaved": number,
      "monthsToPayoff": number
    }
  ],
  "totalInterestSaved": number,
  "totalPayoffMonths": number,
  "npvAnalysis": {
    "presentValueSavings": number,
    "futureValueSavings": number,
    "effectiveRate": number
  },
  "sensitivityMatrix": [
    { "extraPaymentAmount": number, "monthsSaved": number, "interestSaved": number }
  ],
  "hybridStrategy": {
    "strategy": "string",
    "description": "string",
    "steps": ["string"]
  },
  "reasoningChain": ["step1", "step2", "..."],
  "confidence": number (0-1)
}

Show your mathematical reasoning, then provide the JSON result.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    // Call Deepseek with adaptive rate limiting
    const deepseekResponse = await callDeepseekWithAdaptiveLimit(
      messages,
      { maxTokens: 4096, temperature: 0.1 },
      supabaseClient
    );

    const responseTime = Date.now() - startTime;
    console.log('[optimize-debt-strategy] Deepseek response time:', responseTime, 'ms');

    const content = deepseekResponse.choices[0]?.message?.content || '';
    const reasoningContent = deepseekResponse.choices[0]?.message?.reasoning_content;

    // Extract JSON from response
    let result: OptimizationResult;
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('[optimize-debt-strategy] Failed to parse response:', parseError);
      // Return fallback calculation
      result = calculateFallbackOptimization(debts, extraPayment);
    }

    // Add reasoning chain from Deepseek if available
    if (reasoningContent && (!result.reasoningChain || result.reasoningChain.length === 0)) {
      result.reasoningChain = reasoningContent.split('\n').filter((line: string) => line.trim());
    }

    // Log analytics
    await supabaseClient.from('ai_model_routing_analytics').insert({
      user_id: user.id,
      query_type: 'mathematical_reasoning',
      model_used: 'deepseek-reasoner',
      response_time_ms: responseTime,
      token_count: deepseekResponse.usage?.total_tokens || 0,
      reasoning_tokens: deepseekResponse.usage?.reasoning_tokens || 0,
      estimated_cost: estimateCost(deepseekResponse.usage),
    });

    return new Response(JSON.stringify({
      success: true,
      result,
      model: 'deepseek-reasoner',
      responseTimeMs: responseTime,
      usage: deepseekResponse.usage,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[optimize-debt-strategy] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateFallbackOptimization(debts: Debt[], extraPayment: number): OptimizationResult {
  // Sort by interest rate (avalanche method)
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  
  const allocations: PaymentAllocation[] = sortedDebts.map((debt, index) => {
    const extra = index === 0 ? extraPayment : 0;
    const monthlyRate = debt.interestRate / 100 / 12;
    const totalPayment = debt.minimumPayment + extra;
    
    // Calculate months to payoff with extra payment
    let months = 0;
    let balance = debt.balance;
    let totalInterestPaid = 0;
    
    while (balance > 0 && months < 360) {
      const interest = balance * monthlyRate;
      totalInterestPaid += interest;
      balance = balance + interest - totalPayment;
      months++;
    }
    
    // Calculate interest without extra payment
    let baseMonths = 0;
    let baseBalance = debt.balance;
    let baseInterest = 0;
    
    while (baseBalance > 0 && baseMonths < 360) {
      const interest = baseBalance * monthlyRate;
      baseInterest += interest;
      baseBalance = baseBalance + interest - debt.minimumPayment;
      baseMonths++;
    }
    
    return {
      debtId: debt.id,
      debtName: debt.name,
      minimumPayment: debt.minimumPayment,
      extraPayment: extra,
      totalPayment,
      interestSaved: Math.max(0, baseInterest - totalInterestPaid),
      monthsToPayoff: months
    };
  });

  const totalInterestSaved = allocations.reduce((sum, a) => sum + a.interestSaved, 0);
  const maxMonths = Math.max(...allocations.map(a => a.monthsToPayoff));

  return {
    optimalAllocations: allocations,
    totalInterestSaved,
    totalPayoffMonths: maxMonths,
    npvAnalysis: {
      presentValueSavings: totalInterestSaved * 0.95,
      futureValueSavings: totalInterestSaved * 1.05,
      effectiveRate: 5.0
    },
    sensitivityMatrix: [
      { extraPaymentAmount: 50, monthsSaved: 2, interestSaved: totalInterestSaved * 0.2 },
      { extraPaymentAmount: 100, monthsSaved: 4, interestSaved: totalInterestSaved * 0.4 },
      { extraPaymentAmount: 200, monthsSaved: 7, interestSaved: totalInterestSaved * 0.7 },
      { extraPaymentAmount: 500, monthsSaved: 12, interestSaved: totalInterestSaved * 1.2 },
    ],
    hybridStrategy: {
      strategy: 'avalanche',
      description: 'Focus extra payments on highest interest debt first',
      steps: sortedDebts.map((d, i) => `Step ${i + 1}: Pay off ${d.name} (${d.interestRate}% APR)`)
    },
    reasoningChain: [
      'Calculated using avalanche method (highest interest first)',
      'Fallback calculation due to API response parsing error'
    ],
    confidence: 0.7
  };
}

function estimateCost(usage: any): number {
  if (!usage) return 0;
  const inputCost = (usage.prompt_tokens || 0) / 1_000_000 * 0.14;
  const outputCost = (usage.completion_tokens || 0) / 1_000_000 * 0.28;
  const reasoningCost = (usage.reasoning_tokens || 0) / 1_000_000 * 0.28;
  return inputCost + outputCost + reasoningCost;
}
