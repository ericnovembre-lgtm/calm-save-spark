import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callDeepseekWithAdaptiveLimit } from "../_shared/adaptive-deepseek-limiter.ts";
import { captureEdgeException, trackEdgePerformance } from "../_shared/sentry-edge.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PortfolioHolding {
  symbol: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  purchaseDate: string;
  accountType: 'taxable' | 'ira' | 'roth';
}

interface OptimizationRequest {
  holdings: PortfolioHolding[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  taxBracket: number;
  optimizationType: 'rebalance' | 'tax_loss_harvest' | 'risk_analysis' | 'full';
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

    const { holdings, riskTolerance, taxBracket, optimizationType }: OptimizationRequest = await req.json();

    console.log("[optimize-portfolio] Request:", { userId: user.id, optimizationType, holdingsCount: holdings?.length });

    // Calculate current portfolio metrics
    const totalValue = holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
    const totalCostBasis = holdings.reduce((sum, h) => sum + h.costBasis, 0);
    const unrealizedGain = totalValue - totalCostBasis;

    // Identify tax-loss harvesting opportunities
    const tlhOpportunities = holdings
      .filter(h => {
        const gain = (h.currentPrice * h.shares) - h.costBasis;
        return gain < 0 && h.accountType === 'taxable';
      })
      .map(h => ({
        symbol: h.symbol,
        unrealizedLoss: h.costBasis - (h.currentPrice * h.shares),
        potentialTaxSavings: (h.costBasis - (h.currentPrice * h.shares)) * (taxBracket / 100),
        purchaseDate: h.purchaseDate,
        isLongTerm: new Date().getTime() - new Date(h.purchaseDate).getTime() > 365 * 24 * 60 * 60 * 1000,
      }));

    // Build Deepseek prompt for portfolio optimization
    const systemPrompt = `You are an expert portfolio optimization AI with deep knowledge of Modern Portfolio Theory, tax-efficient investing, and risk management. Provide precise mathematical analysis with step-by-step reasoning.

Always respond with valid JSON in this exact format:
{
  "riskMetrics": {
    "sharpeRatio": <number>,
    "sortinoRatio": <number>,
    "maxDrawdown": <number>,
    "beta": <number>,
    "volatility": <number>
  },
  "taxAnalysis": {
    "totalUnrealizedGains": <number>,
    "totalUnrealizedLosses": <number>,
    "potentialTaxSavings": <number>,
    "washSaleRisks": [{"symbol": "<string>", "riskLevel": "<low|medium|high>", "waitDays": <number>}]
  },
  "rebalancingRecommendations": [
    {
      "action": "<buy|sell>",
      "symbol": "<string>",
      "shares": <number>,
      "reason": "<string>",
      "priority": "<high|medium|low>"
    }
  ],
  "taxLossHarvestingActions": [
    {
      "sellSymbol": "<string>",
      "sellShares": <number>,
      "taxSavings": <number>,
      "replacementSymbol": "<string>",
      "correlation": <number>,
      "washSaleDate": "<ISO date string>"
    }
  ],
  "optimalAllocation": {
    "stocks": <number 0-100>,
    "bonds": <number 0-100>,
    "cash": <number 0-100>,
    "alternatives": <number 0-100>
  },
  "reasoning": "<detailed step-by-step mathematical reasoning>"
}`;

    const userPrompt = `Analyze this portfolio and provide optimization recommendations:

## Portfolio Holdings
${JSON.stringify(holdings, null, 2)}

## Current Metrics
- Total Value: $${totalValue.toFixed(2)}
- Total Cost Basis: $${totalCostBasis.toFixed(2)}
- Unrealized Gain/Loss: $${unrealizedGain.toFixed(2)}

## Tax-Loss Harvesting Opportunities Identified
${JSON.stringify(tlhOpportunities, null, 2)}

## Investor Profile
- Risk Tolerance: ${riskTolerance}
- Tax Bracket: ${taxBracket}%
- Optimization Focus: ${optimizationType}

## Instructions
1. Calculate risk-adjusted return metrics (Sharpe ratio, Sortino ratio, max drawdown)
2. Analyze tax-loss harvesting opportunities with wash sale rule compliance (31-day window)
3. Suggest replacement securities that maintain factor exposure
4. Recommend rebalancing trades to optimize risk-adjusted returns
5. Provide target allocation based on risk tolerance
6. Show all mathematical calculations in your reasoning`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // Track Deepseek performance with Sentry
    const { result: response, duration: deepseekDuration } = await trackEdgePerformance(
      'deepseek-portfolio-optimization',
      () => callDeepseekWithAdaptiveLimit(messages, { maxTokens: 4096, temperature: 0.1 }, supabase)
    );
    console.log(`[optimize-portfolio] Deepseek call: ${deepseekDuration}ms`);
    
    const content = response.choices[0]?.message?.content || '{}';
    const reasoningContent = response.choices[0]?.message?.reasoning_content || '';

    // Parse the response
    let optimizationResult;
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimizationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("[optimize-portfolio] Parse error:", parseError);
      // Return a structured fallback
      optimizationResult = {
        riskMetrics: {
          sharpeRatio: 0,
          sortinoRatio: 0,
          maxDrawdown: 0,
          beta: 1,
          volatility: 0,
        },
        taxAnalysis: {
          totalUnrealizedGains: Math.max(0, unrealizedGain),
          totalUnrealizedLosses: Math.abs(Math.min(0, unrealizedGain)),
          potentialTaxSavings: tlhOpportunities.reduce((sum, o) => sum + o.potentialTaxSavings, 0),
          washSaleRisks: [],
        },
        rebalancingRecommendations: [],
        taxLossHarvestingActions: tlhOpportunities.map(o => ({
          sellSymbol: o.symbol,
          sellShares: 0,
          taxSavings: o.potentialTaxSavings,
          replacementSymbol: '',
          correlation: 0,
          washSaleDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
        })),
        optimalAllocation: {
          stocks: riskTolerance === 'aggressive' ? 80 : riskTolerance === 'moderate' ? 60 : 40,
          bonds: riskTolerance === 'aggressive' ? 10 : riskTolerance === 'moderate' ? 30 : 50,
          cash: 5,
          alternatives: 5,
        },
        reasoning: content,
      };
    }

    // Add chain-of-thought reasoning if available
    if (reasoningContent) {
      optimizationResult.chainOfThought = reasoningContent;
    }

    // Store optimization in history
    await supabase.from('portfolio_optimization_history').insert({
      user_id: user.id,
      optimization_type: optimizationType,
      portfolio_data: { holdings, totalValue, totalCostBasis },
      recommendations: optimizationResult.rebalancingRecommendations || [],
      risk_metrics: optimizationResult.riskMetrics || {},
      tax_analysis: optimizationResult.taxAnalysis || {},
      reasoning_chain: { reasoning: optimizationResult.reasoning, chainOfThought: reasoningContent },
    });

    // Log analytics
    await supabase.from('ai_model_routing_analytics').insert({
      user_id: user.id,
      model_used: 'deepseek-reasoner',
      query_type: 'portfolio_optimization',
      token_count: response.usage?.total_tokens || 0,
      reasoning_tokens: response.usage?.reasoning_tokens || 0,
      response_time_ms: 0,
    });

    console.log("[optimize-portfolio] Success, tokens used:", response.usage?.total_tokens);

    return new Response(JSON.stringify(optimizationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[optimize-portfolio] Error:", error);
    
    // Capture error to Sentry with rich context
    // Note: Variables may not be defined if error occurred early
    let contextUserId: string | undefined;
    let contextOptimizationType: string | undefined;
    let contextHoldingsCount: number | undefined;
    let contextRiskTolerance: string | undefined;
    let contextTaxBracket: number | undefined;
    
    try {
      // Try to get context from request body
      const body = await req.clone().json();
      contextUserId = body?.userId;
      contextOptimizationType = body?.optimizationType;
      contextHoldingsCount = body?.holdings?.length;
      contextRiskTolerance = body?.riskTolerance;
      contextTaxBracket = body?.taxBracket;
    } catch {
      // Request body already consumed or invalid
    }
    
    await captureEdgeException(error, {
      tags: { 
        function: 'optimize-portfolio', 
        optimization_type: contextOptimizationType || 'unknown',
        risk_tolerance: contextRiskTolerance || 'unknown'
      },
      extra: { 
        user_id: contextUserId,
        holdings_count: contextHoldingsCount,
        tax_bracket: contextTaxBracket,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Portfolio optimization failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
