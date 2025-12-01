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
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { scenarioId, parameters, monteCarloRuns = 100 } = await req.json();

    // Check cache first for expensive simulations (24 hour TTL)
    const cacheKey = `digital_twin:${user.id}:${scenarioId || 'new'}:${monteCarloRuns}`;
    const { data: cachedData } = await supabaseClient.rpc('get_cached_response', {
      p_cache_key: cacheKey
    });

    if (cachedData) {
      console.log('Returning cached digital twin simulation');
      return new Response(
        JSON.stringify(cachedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' } }
      );
    }

    // Get user's current financial state
    let { data: profile } = await supabaseClient
      .from('digital_twin_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Auto-create profile if missing
    if (!profile) {
      console.log('No profile found, auto-creating default profile');

      // Query user's connected accounts for current balance
      const { data: accounts } = await supabaseClient
        .from('connected_accounts')
        .select('balance')
        .eq('user_id', user.id);

      const totalBalance = accounts?.reduce((sum, acc) => 
        sum + (Number(acc.balance) || 0), 0) || 10000;

      // Query recent transactions to estimate income/expenses
      const { data: recentTransactions } = await supabaseClient
        .from('transactions')
        .select('amount, category')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .limit(100);

      const monthlyIncome = (recentTransactions || [])
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) / 3 || 5000;
      
      const monthlyExpenses = (recentTransactions || [])
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) / 3 || 3750;

      // Create default profile
      const { data: newProfile, error: profileError } = await supabaseClient
        .from('digital_twin_profiles')
        .insert({
          user_id: user.id,
          current_state: {
            netWorth: totalBalance,
            savings: totalBalance * 0.2,
            annualIncome: monthlyIncome * 12,
            annualExpenses: monthlyExpenses * 12,
            age: 30
          },
          life_stage: 'growth',
          risk_tolerance: 'moderate'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Failed to create profile:', profileError);
        return new Response(JSON.stringify({ error: 'Failed to create profile' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      profile = newProfile;
      console.log('Auto-created profile with netWorth:', totalBalance);
    }

    // Monte Carlo simulation logic
    const simulations = [];
    const currentState = profile.current_state as any;
    
    for (let i = 0; i < monteCarloRuns; i++) {
      const scenario = runSingleSimulation(currentState, parameters);
      simulations.push(scenario);
    }

    // Calculate success probability
    const successfulRuns = simulations.filter(s => s.finalNetWorth >= (parameters.targetNetWorth || 1000000));
    const successProbability = (successfulRuns.length / monteCarloRuns) * 100;

    // Calculate percentiles
    const sortedResults = simulations.map(s => s.finalNetWorth).sort((a, b) => a - b);
    const p10 = sortedResults[Math.floor(monteCarloRuns * 0.1)];
    const p50 = sortedResults[Math.floor(monteCarloRuns * 0.5)];
    const p90 = sortedResults[Math.floor(monteCarloRuns * 0.9)];

    // Generate timeline projections (yearly)
    const timelineYears = parameters.yearsToProject || 30;
    const timeline = [];
    
    for (let year = 0; year <= timelineYears; year++) {
      const yearResults = simulations.map(s => s.timeline[year]).filter(Boolean);
      timeline.push({
        year: new Date().getFullYear() + year,
        age: (currentState.age || 30) + year,
        median: calculateMedian(yearResults.map((r: any) => r.netWorth)),
        p10: calculatePercentile(yearResults.map((r: any) => r.netWorth), 10),
        p90: calculatePercentile(yearResults.map((r: any) => r.netWorth), 90),
      });
    }

    // Save scenario results
    const { data: scenario, error: scenarioError } = await supabaseClient
      .from('twin_scenarios')
      .upsert({
        id: scenarioId,
        twin_id: profile.id,
        user_id: user.id,
        scenario_type: parameters.scenarioType || 'custom',
        scenario_name: parameters.name || 'Untitled Scenario',
        parameters,
        monte_carlo_runs: monteCarloRuns,
        success_probability: successProbability,
        projected_outcomes: timeline,
      })
      .select()
      .single();

    if (scenarioError) throw scenarioError;

    // Generate baseline (current trajectory) and scenario paths for chart
    const baselineSimulation = runSingleSimulation(currentState, {
      ...parameters,
      scenarioType: 'baseline', // No life changes
    });

    const scenarioSimulation = simulations[Math.floor(monteCarloRuns / 2)]; // Use median simulation

    // Transform timeline to {date, value} format for frontend
    const baseline = baselineSimulation.timeline.map((point: any) => ({
      date: `${new Date().getFullYear() + point.year}-01-01`,
      value: point.netWorth
    }));

    const scenarioPath = scenarioSimulation.timeline.map((point: any) => ({
      date: `${new Date().getFullYear() + point.year}-01-01`,
      value: point.netWorth
    }));

    // Generate p10 and p90 confidence interval paths
    const p10Path = timeline.map(point => ({
      date: `${point.year}-01-01`,
      value: point.p10
    }));

    const p90Path = timeline.map(point => ({
      date: `${point.year}-01-01`,
      value: point.p90
    }));

    const responseData = {
      baseline,
      scenario: scenarioPath,
      confidence: {
        p10: p10Path,
        p90: p90Path,
      },
      metadata: {
        scenarioId: scenario?.id,
        successProbability,
        percentiles: { p10, p50, p90 },
        simulations: simulations.length,
      },
    };

    // Cache the response (24 hour TTL for expensive simulations)
    await supabaseClient.rpc('set_cached_response', {
      p_cache_key: cacheKey,
      p_cache_type: 'digital_twin',
      p_user_id: user.id,
      p_response_data: responseData,
      p_ttl_seconds: 86400 // 24 hours
    });

    console.log(`Digital twin simulation complete (${monteCarloRuns} runs) and cached`);

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' } }
    );
  } catch (error) {
    console.error('Error in digital-twin-simulate:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function runSingleSimulation(currentState: any, parameters: any) {
  const yearsToProject = parameters.yearsToProject || 30;
  let netWorth = currentState.netWorth || 0;
  let savings = currentState.savings || 0;
  let income = currentState.annualIncome || 50000;
  let expenses = currentState.annualExpenses || 40000;
  
  const timeline = [];

  for (let year = 0; year <= yearsToProject; year++) {
    // Apply random market returns (mean 7%, std dev 15%)
    const marketReturn = randomNormal(0.07, 0.15);
    
    // Apply inflation (mean 3%, std dev 2%)
    const inflation = randomNormal(0.03, 0.02);
    
    // Adjust for scenario parameters
    if (parameters.scenarioType === 'career_change' && year === (parameters.changeYear || 5)) {
      income = parameters.newIncome || income * 0.8;
    }
    if (parameters.scenarioType === 'buy_home' && year === (parameters.purchaseYear || 2)) {
      netWorth -= parameters.downPayment || 0;
      expenses += parameters.mortgagePayment || 0;
    }
    
    // Calculate year's change
    const annualSavings = income - expenses;
    savings += annualSavings;
    netWorth += annualSavings + (netWorth * marketReturn);
    
    // Adjust for inflation
    expenses *= (1 + inflation);
    income *= (1 + parameters.salaryGrowth || 0.03);
    
    timeline.push({
      year,
      netWorth: Math.round(netWorth),
      savings: Math.round(savings),
      income: Math.round(income),
      expenses: Math.round(expenses),
    });
  }

  return {
    finalNetWorth: netWorth,
    timeline,
  };
}

function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z0;
}

function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor((percentile / 100) * sorted.length);
  return sorted[index] || 0;
}
