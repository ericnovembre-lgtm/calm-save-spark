import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    if (!user) throw new Error('Unauthorized');

    const { params } = await req.json();
    const { monthlyInvestment, savingsRate, timeHorizonYears, emergencyFund } = params;

    // Calculate monthly rate
    const monthlyRate = savingsRate / 100 / 12;
    const totalMonths = timeHorizonYears * 12;

    // Generate time series for each scenario
    const generateScenario = (rate: number, investmentMultiplier: number) => {
      const data = [];
      let balance = emergencyFund;
      const adjustedMonthly = monthlyInvestment * investmentMultiplier;
      const adjustedRate = (rate / 100) / 12;

      for (let month = 0; month <= totalMonths; month++) {
        const date = new Date();
        date.setMonth(date.getMonth() + month);
        
        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(balance * 100) / 100
        });

        // Apply compound interest and add monthly investment
        balance = balance * (1 + adjustedRate) + adjustedMonthly;
      }

      return data;
    };

    // Conservative: 80% of rate, 80% of investment
    const conservative = generateScenario(savingsRate * 0.8, 0.8);
    
    // Moderate: as specified
    const moderate = generateScenario(savingsRate, 1.0);
    
    // Aggressive: 120% of rate, 120% of investment
    const aggressive = generateScenario(savingsRate * 1.2, 1.2);
    
    // Baseline: no additional investment, just interest on emergency fund
    const baseline = generateScenario(2, 0);

    return new Response(
      JSON.stringify({
        conservative,
        moderate,
        aggressive,
        baseline
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('calculate-scenarios error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
