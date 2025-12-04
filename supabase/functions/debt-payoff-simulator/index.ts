import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callDeepseek, buildFinancialReasoningPrompt, estimateDeepseekCost } from "../_shared/deepseek-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { 
      strategy = 'avalanche', 
      extraPayment = 0,
      includeAIRecommendations = false 
    } = await req.json().catch(() => ({}));

    // Fetch all debts
    const { data: debts } = await supabaseClient
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('interest_rate', { ascending: false });

    if (!debts || debts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          simulations: [],
          message: 'No debts found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Run both avalanche and snowball simulations
    const avalancheResult = runSimulation([...debts], 'avalanche', extraPayment);
    const snowballResult = runSimulation([...debts], 'snowball', extraPayment);

    // Use the requested strategy's result
    const primaryResult = strategy === 'avalanche' ? avalancheResult : snowballResult;

    let aiRecommendations = null;
    let reasoningChain = null;

    // Get AI-powered recommendations if requested
    if (includeAIRecommendations && debts.length > 0) {
      try {
        console.log('[Debt Simulator] Fetching Deepseek AI recommendations...');
        
        const debtPortfolio = debts.map(d => ({
          name: d.debt_name,
          balance: parseFloat(String(d.current_balance)),
          rate: parseFloat(String(d.interest_rate)),
          minimumPayment: parseFloat(String(d.minimum_payment)) || 0,
          type: d.debt_type
        }));

        const prompt = buildFinancialReasoningPrompt(
          'Analyze this debt portfolio and recommend the optimal payoff strategy with mathematical proof.',
          {
            debts: debtPortfolio,
            availableExtraPayment: extraPayment,
            avalancheResult: {
              monthsToPayoff: avalancheResult.summary.months_to_payoff,
              totalInterest: avalancheResult.summary.total_interest_paid,
              totalPaid: avalancheResult.summary.total_paid
            },
            snowballResult: {
              monthsToPayoff: snowballResult.summary.months_to_payoff,
              totalInterest: snowballResult.summary.total_interest_paid,
              totalPaid: snowballResult.summary.total_paid
            }
          }
        );

        const systemPrompt = `You are a debt optimization expert. Analyze the debt portfolio and provide:
1. Mathematical proof of which strategy (avalanche vs snowball) saves more money
2. Optimal allocation of extra payments across debts
3. Hybrid strategy recommendations when applicable
4. Breakeven analysis for when extra payments make a significant difference
5. Psychological considerations for debt motivation

Return your analysis as JSON with this structure:
{
  "recommended_strategy": "avalanche" | "snowball" | "hybrid",
  "mathematical_proof": "Step-by-step calculation showing interest savings",
  "optimal_allocation": [{ "debt_name": string, "extra_payment": number, "reasoning": string }],
  "hybrid_recommendation": string | null,
  "breakeven_extra_payment": number,
  "interest_savings_vs_alternative": number,
  "time_savings_months": number,
  "psychological_score": number,
  "key_insight": string
}`;

        const response = await callDeepseek([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ], { maxTokens: 4096, temperature: 0.1 });

        const content = response.choices[0].message.content;
        reasoningChain = response.choices[0].message.reasoning_content || null;

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiRecommendations = JSON.parse(jsonMatch[0]);
        }

        // Log cost estimation
        const cost = estimateDeepseekCost(
          response.usage.prompt_tokens,
          response.usage.completion_tokens,
          response.usage.reasoning_tokens || 0
        );
        console.log('[Debt Simulator] Deepseek cost:', `$${cost.toFixed(4)}`);

        // Log to analytics
        try {
          await supabaseClient.from('ai_model_routing_analytics').insert({
            user_id: user.id,
            query_type: 'mathematical_reasoning',
            model_used: 'deepseek-reasoner',
            response_time_ms: Date.now(),
            token_count: response.usage.total_tokens,
            estimated_cost: cost
          });
        } catch (logError) {
          console.warn('Failed to log analytics:', logError);
        }

      } catch (aiError) {
        console.error('[Debt Simulator] AI recommendations failed:', aiError);
        // Continue without AI recommendations
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        simulation: primaryResult.simulation,
        summary: primaryResult.summary,
        comparison: {
          avalanche: avalancheResult.summary,
          snowball: snowballResult.summary
        },
        aiRecommendations,
        reasoningChain,
        model: includeAIRecommendations ? 'deepseek-reasoner' : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Debt Payoff Simulator Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function runSimulation(debts: any[], strategy: 'avalanche' | 'snowball', extraPayment: number) {
  // Sort debts based on strategy
  let sortedDebts = [...debts];
  if (strategy === 'avalanche') {
    sortedDebts.sort((a, b) => parseFloat(String(b.interest_rate)) - parseFloat(String(a.interest_rate)));
  } else {
    sortedDebts.sort((a, b) => parseFloat(String(a.current_balance)) - parseFloat(String(b.current_balance)));
  }

  const simulation = [];
  const debtStates = sortedDebts.map(d => ({
    ...d,
    remaining: parseFloat(String(d.current_balance)),
    paid_off: false
  }));

  let month = 0;
  const maxMonths = 360;
  let totalInterestPaid = 0;

  while (debtStates.some(d => !d.paid_off) && month < maxMonths) {
    month++;
    let availableExtra = extraPayment;

    debtStates.forEach((debt, idx) => {
      if (debt.paid_off) return;

      const monthlyRate = parseFloat(String(debt.interest_rate)) / 100 / 12;
      const interestCharge = debt.remaining * monthlyRate;
      totalInterestPaid += interestCharge;
      
      const minPayment = parseFloat(String(debt.minimum_payment)) || 0;
      let payment = minPayment;

      if (idx === debtStates.findIndex(d => !d.paid_off) && availableExtra > 0) {
        payment += availableExtra;
        availableExtra = 0;
      }

      const principalPayment = payment - interestCharge;
      debt.remaining = Math.max(0, debt.remaining - principalPayment);

      if (debt.remaining === 0) {
        debt.paid_off = true;
      }
    });

    const totalRemaining = debtStates.reduce((sum, d) => sum + d.remaining, 0);
    simulation.push({
      month,
      total_remaining: totalRemaining,
      debts_paid_off: debtStates.filter(d => d.paid_off).length,
      debts: debtStates.map(d => ({
        name: d.debt_name,
        remaining: d.remaining,
        paid_off: d.paid_off
      }))
    });

    if (totalRemaining === 0) break;
  }

  const totalPrincipal = debts.reduce((sum, d) => sum + parseFloat(String(d.current_balance)), 0);

  return {
    simulation,
    summary: {
      strategy,
      months_to_payoff: month,
      years_to_payoff: (month / 12).toFixed(1),
      total_principal: totalPrincipal,
      total_interest_paid: Math.round(totalInterestPaid),
      total_paid: Math.round(totalPrincipal + totalInterestPaid),
      extra_payment_per_month: extraPayment
    }
  };
}
