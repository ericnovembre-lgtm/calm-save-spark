import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Carbon emission factors (kg CO2 per dollar spent)
const EMISSION_FACTORS: Record<string, number> = {
  transport: 0.5,
  food: 0.3,
  utilities: 0.4,
  retail: 0.2,
  entertainment: 0.15,
  travel: 0.8,
  fuel: 1.2,
  default: 0.25,
};

Deno.serve(async (req) => {
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { transaction_id, amount, category, merchant } = await req.json();

    // Determine emission factor based on category
    const categoryKey = category?.toLowerCase() || 'default';
    const emissionFactor = EMISSION_FACTORS[categoryKey] || EMISSION_FACTORS.default;
    
    // Calculate carbon emissions
    const carbonKg = amount * emissionFactor;

    console.log('Carbon calculation:', { amount, category, carbonKg });

    // Store carbon footprint log
    const { error: insertError } = await supabaseClient
      .from('carbon_footprint_logs')
      .insert({
        transaction_id,
        carbon_kg: carbonKg,
        category: categoryKey,
        merchant,
        log_date: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error inserting carbon log:', insertError);
      throw insertError;
    }

    // Get monthly total
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: monthlyLogs, error: logsError } = await supabaseClient
      .from('carbon_footprint_logs')
      .select('carbon_kg')
      .gte('log_date', thirtyDaysAgo.toISOString());

    if (logsError) throw logsError;

    const monthlyTotal = monthlyLogs?.reduce((sum, log) => sum + parseFloat(log.carbon_kg.toString()), 0) || 0;

    return new Response(
      JSON.stringify({
        carbon_kg: carbonKg,
        monthly_total: monthlyTotal,
        equivalent_trees: Math.round(carbonKg / 21.77), // Trees needed to offset
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in calculate-carbon-footprint:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
