import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Fetch debts
    const { data: debts } = await supabaseClient
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (!debts || debts.length <= 1) {
      return new Response(
        JSON.stringify({ 
          error: 'Need at least 2 debts for consolidation analysis',
          recommendation: 'not_applicable'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Calculate metrics
    const totalDebt = debts.reduce((sum, d) => sum + Number(d.current_balance), 0);
    const totalMonthlyPayment = debts.reduce((sum, d) => sum + Number(d.minimum_payment), 0);
    const weightedAPR = debts.reduce((sum, d) => 
      sum + (Number(d.interest_rate) * Number(d.current_balance) / totalDebt), 0
    );

    // Simulate consolidation scenarios
    const scenarios = [
      {
        name: 'Personal Loan (10% APR)',
        apr: 10,
        monthlyPayment: calculatePayment(totalDebt, 10, 60),
        months: 60
      },
      {
        name: 'Balance Transfer (0% for 18mo, then 15%)',
        apr: 15,
        monthlyPayment: calculatePayment(totalDebt, 0, 18),
        promoMonths: 18,
        postPromoAPR: 15
      }
    ];

    // Fetch payment history for consistency analysis
    const { data: paymentHistory } = await supabaseClient
      .from('debt_payment_history')
      .select('*')
      .eq('user_id', user.id)
      .order('payment_date', { ascending: false })
      .limit(50);

    const paymentConsistency = calculatePaymentConsistency(paymentHistory || [], debts);

    // Build AI prompt
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a debt consolidation expert helping users decide if consolidation makes sense.

Analyze this debt portfolio and evaluate consolidation options:

CURRENT DEBT STRUCTURE:
${debts.map(d => `
- ${d.debt_name} (${d.debt_type || 'Other'}): $${d.current_balance} @ ${d.interest_rate}%
  Monthly Payment: $${d.minimum_payment}
`).join('\n')}

CURRENT METRICS:
- Total Debt: $${totalDebt.toFixed(2)}
- Weighted Avg APR: ${weightedAPR.toFixed(2)}%
- Total Monthly Payment: $${totalMonthlyPayment.toFixed(2)}
- Number of Creditors: ${debts.length}

CONSOLIDATION SCENARIOS:
${scenarios.map(s => `
${s.name}:
- Estimated Monthly Payment: $${s.monthlyPayment.toFixed(2)}
- Payoff Time: ${s.months} months
${s.promoMonths ? `- Promotional Period: ${s.promoMonths} months @ 0%` : ''}
`).join('\n')}

PAYMENT BEHAVIOR:
- Payment Consistency: ${paymentConsistency}/100
- Payment History Records: ${paymentHistory?.length || 0}

Evaluate whether consolidation makes sense for this specific user. Consider:
1. Interest rate savings potential
2. Simplification benefits (${debts.length} creditors → 1)
3. Payment management complexity
4. Risks and downsides
5. User's payment consistency

Provide personalized pros/cons and lender recommendations based on their debt profile.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Should I consolidate my debts? Provide detailed analysis.' }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'analyze_consolidation',
            description: 'Evaluate debt consolidation options',
            parameters: {
              type: 'object',
              properties: {
                recommendation: {
                  type: 'string',
                  enum: ['consolidate', 'keep_separate', 'partial_consolidate'],
                  description: 'Overall recommendation'
                },
                confidence_score: { 
                  type: 'number', 
                  description: 'Confidence in recommendation (0-100)'
                },
                best_option: {
                  type: 'object',
                  properties: {
                    type: { 
                      type: 'string', 
                      enum: ['personal_loan', 'balance_transfer', 'heloc', 'debt_management_plan']
                    },
                    estimated_apr: { type: 'number' },
                    monthly_payment: { type: 'number' },
                    total_interest_saved: { type: 'number' },
                    payoff_months: { type: 'number' }
                  }
                },
                pros: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Personalized advantages (3-5)'
                },
                cons: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Personalized disadvantages (2-4)'
                },
                risk_factors: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Specific risks for this user'
                },
                lender_suggestions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' },
                      apr_range: { type: 'string' },
                      loan_amount_range: { type: 'string' },
                      why_recommended: { type: 'string' }
                    }
                  },
                  description: '3-5 lender recommendations'
                },
                next_steps: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Actionable next steps'
                }
              },
              required: ['recommendation', 'confidence_score', 'pros', 'cons'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'analyze_consolidation' } }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    if (!aiResponse.choices?.[0]?.message?.tool_calls?.[0]) {
      throw new Error('Invalid AI response format');
    }

    const analysis = JSON.parse(aiResponse.choices[0].message.tool_calls[0].function.arguments);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis,
        currentMetrics: {
          totalDebt,
          weightedAPR,
          totalMonthlyPayment,
          numCreditors: debts.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Consolidation analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions
function calculatePayment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) {
    return principal / months;
  }
  const monthlyRate = annualRate / 100 / 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
         (Math.pow(1 + monthlyRate, months) - 1);
}

function calculatePaymentConsistency(payments: any[], debts: any[]): number {
  if (payments.length === 0) return 50;
  
  const onTimePayments = payments.filter(p => {
    const debt = debts.find(d => d.id === p.debt_id);
    return debt && p.amount >= Number(debt.minimum_payment);
  }).length;
  
  return Math.round((onTimePayments / payments.length) * 100);
}
