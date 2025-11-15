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

    const { action } = await req.json();

    if (action === 'calculate_paycheck') {
      // Calculate synthetic paycheck from irregular income
      const { data: incomeStreams } = await supabaseClient
        .from('business_income_streams')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const totalMonthlyIncome = incomeStreams?.reduce(
        (sum, stream) => sum + (stream.average_monthly_revenue || 0),
        0
      ) || 0;

      // Tax withholding calculations (simplified)
      const federalRate = 0.22; // 22% effective federal rate
      const stateRate = 0.05; // 5% average state rate
      const ficaRate = 0.153; // 15.3% self-employment tax

      const withholding_federal = totalMonthlyIncome * federalRate;
      const withholding_state = totalMonthlyIncome * stateRate;
      const withholding_fica = totalMonthlyIncome * ficaRate;
      const net_paycheck = totalMonthlyIncome - withholding_federal - withholding_state - withholding_fica;

      const periodEnd = new Date();
      const periodStart = new Date();
      periodStart.setMonth(periodStart.getMonth() - 1);

      const { data: paycheck, error } = await supabaseClient
        .from('synthetic_paychecks')
        .insert({
          user_id: user.id,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          total_income: totalMonthlyIncome,
          calculated_paycheck: totalMonthlyIncome,
          withholding_federal,
          withholding_state,
          withholding_fica,
          net_paycheck,
          calculation_method: 'rolling_average',
          income_sources: incomeStreams || [],
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ paycheck }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'project_quarterly_taxes') {
      const { tax_year } = await req.json();
      const currentYear = tax_year || new Date().getFullYear();

      // Get income streams
      const { data: incomeStreams } = await supabaseClient
        .from('business_income_streams')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const annualIncome = (incomeStreams?.reduce(
        (sum, stream) => sum + (stream.average_monthly_revenue || 0),
        0
      ) || 0) * 12;

      // Estimate expenses at 30% of income
      const annualExpenses = annualIncome * 0.30;
      const netIncome = annualIncome - annualExpenses;

      // Tax calculation (simplified)
      const federalRate = 0.22;
      const stateRate = 0.05;
      const selfEmploymentRate = 0.153;

      const quarterlyIncome = netIncome / 4;
      const quarterlyExpenses = annualExpenses / 4;

      const projections = [];
      for (let quarter = 1; quarter <= 4; quarter++) {
        const dueMonth = quarter * 3; // Q1: Mar, Q2: Jun, Q3: Sep, Q4: Dec
        const dueDate = new Date(currentYear, dueMonth, 15);

        const estimated_tax_federal = (quarterlyIncome * federalRate);
        const estimated_tax_state = (quarterlyIncome * stateRate);
        const estimated_tax_self_employment = (quarterlyIncome * selfEmploymentRate);
        const total_estimated_tax = estimated_tax_federal + estimated_tax_state + estimated_tax_self_employment;

        projections.push({
          user_id: user.id,
          tax_year: currentYear,
          quarter,
          projected_income: quarterlyIncome + quarterlyExpenses,
          projected_expenses: quarterlyExpenses,
          estimated_tax_federal,
          estimated_tax_state,
          estimated_tax_self_employment,
          total_estimated_tax,
          due_date: dueDate.toISOString().split('T')[0],
          payment_status: 'pending',
          confidence_score: 0.85,
        });
      }

      // Upsert projections (update if exists, insert if not)
      const { error } = await supabaseClient
        .from('quarterly_tax_projections')
        .upsert(projections, { onConflict: 'user_id,business_profile_id,tax_year,quarter' });

      if (error) throw error;

      return new Response(
        JSON.stringify({ projections }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in business-tax-calculator:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
