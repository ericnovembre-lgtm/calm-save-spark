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
    if (!user) throw new Error('Not authenticated');

    // Get user's debts
    const { data: debts } = await supabaseClient
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .in('debt_type', ['mortgage', 'auto_loan', 'student_loan']);

    if (!debts || debts.length === 0) {
      return new Response(
        JSON.stringify({ opportunities: [], message: 'No eligible loans found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get latest market rates
    const { data: marketRates } = await supabaseClient
      .from('market_loan_rates')
      .select('*')
      .order('fetched_at', { ascending: false })
      .limit(100);

    const opportunities = [];

    for (const debt of debts) {
      const debtType = debt.debt_type;
      let loanType = 'personal';

      // Map debt type to loan type
      if (debtType === 'mortgage') loanType = 'mortgage_30yr';
      else if (debtType === 'auto_loan') loanType = 'auto_used';
      else if (debtType === 'student_loan') loanType = 'student_fixed';

      // Find best available rate for this loan type
      const applicableRates = marketRates?.filter(r => r.loan_type === loanType) || [];
      if (applicableRates.length === 0) continue;

      const bestRate = applicableRates.reduce((best, current) => 
        Number(current.rate) < Number(best.rate) ? current : best
      );

      const currentRate = Number(debt.interest_rate) / 100;
      const availableRate = Number(bestRate.rate);
      const balance = Number(debt.current_balance);
      const termMonths = 360; // Assume 30-year default

      // Calculate savings
      if (availableRate < currentRate - 0.005) { // At least 0.5% improvement
        const currentMonthlyRate = currentRate / 12;
        const newMonthlyRate = availableRate / 12;

        const currentPayment = balance * (currentMonthlyRate * Math.pow(1 + currentMonthlyRate, termMonths)) / 
          (Math.pow(1 + currentMonthlyRate, termMonths) - 1);
        
        const newPayment = balance * (newMonthlyRate * Math.pow(1 + newMonthlyRate, termMonths)) / 
          (Math.pow(1 + newMonthlyRate, termMonths) - 1);

        const currentTotalInterest = (currentPayment * termMonths) - balance;
        const newTotalInterest = (newPayment * termMonths) - balance;
        const netSavings = currentTotalInterest - newTotalInterest;

        const closingCosts = balance * 0.02; // Estimate 2% of loan amount
        const breakEvenMonths = Math.ceil(closingCosts / (currentPayment - newPayment));

        // Only recommend if net savings after costs is positive
        if (netSavings > closingCosts && breakEvenMonths < 60) {
          opportunities.push({
            debt_id: debt.id,
            loan_type: debtType,
            current_rate: currentRate,
            current_balance: balance,
            current_monthly_payment: currentPayment,
            current_term_months: termMonths,
            available_rate: availableRate,
            available_term_months: termMonths,
            projected_monthly_payment: newPayment,
            projected_total_interest: newTotalInterest,
            current_total_interest: currentTotalInterest,
            net_savings: netSavings - closingCosts,
            break_even_months: breakEvenMonths,
            closing_costs: closingCosts,
            lender_name: bestRate.source,
            rate_source: bestRate.source,
            confidence_score: 0.85,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }
    }

    // Save opportunities to database
    if (opportunities.length > 0) {
      const { error } = await supabaseClient
        .from('refinancing_opportunities')
        .insert(opportunities.map(o => ({ ...o, user_id: user.id })));

      if (error) console.error('Error saving opportunities:', error);
    }

    return new Response(
      JSON.stringify({
        opportunities: opportunities.length,
        totalSavings: opportunities.reduce((sum, o) => sum + o.net_savings, 0),
        details: opportunities,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in liability-agent:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
