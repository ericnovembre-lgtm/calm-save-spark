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

    const { strategy = 'avalanche', extraPayment = 0 } = await req.json().catch(() => ({}));

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

    // Sort debts based on strategy
    let sortedDebts = [...debts];
    if (strategy === 'avalanche') {
      // Highest interest rate first
      sortedDebts.sort((a, b) => parseFloat(String(b.interest_rate)) - parseFloat(String(a.interest_rate)));
    } else if (strategy === 'snowball') {
      // Smallest balance first
      sortedDebts.sort((a, b) => parseFloat(String(a.current_balance)) - parseFloat(String(b.current_balance)));
    }

    // Simulate payoff
    const simulation = [];
    const debtStates = sortedDebts.map(d => ({
      ...d,
      remaining: parseFloat(String(d.current_balance)),
      paid_off: false
    }));

    let month = 0;
    const maxMonths = 360; // 30 years max

    while (debtStates.some(d => !d.paid_off) && month < maxMonths) {
      month++;
      let availableExtra = extraPayment;

      debtStates.forEach((debt, idx) => {
        if (debt.paid_off) return;

        const monthlyRate = parseFloat(String(debt.interest_rate)) / 100 / 12;
        const interestCharge = debt.remaining * monthlyRate;
        const minPayment = parseFloat(String(debt.minimum_payment)) || 0;

        let payment = minPayment;

        // Apply extra payment to the priority debt (first non-paid-off debt in strategy order)
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

    // Calculate summary
    const totalInterestPaid = simulation.reduce((sum, snap) => {
      return sum + debtStates.reduce((debtSum, debt) => {
        const monthlyRate = parseFloat(String(debt.interest_rate)) / 100 / 12;
        return debtSum + (debt.remaining > 0 ? debt.remaining * monthlyRate : 0);
      }, 0);
    }, 0);

    const totalPrincipal = debts.reduce((sum, d) => sum + parseFloat(String(d.current_balance)), 0);

    return new Response(
      JSON.stringify({ 
        success: true,
        simulation,
        summary: {
          strategy,
          months_to_payoff: month,
          years_to_payoff: (month / 12).toFixed(1),
          total_principal: totalPrincipal,
          total_interest_paid: totalInterestPaid,
          total_paid: totalPrincipal + totalInterestPaid,
          extra_payment_per_month: extraPayment
        }
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
