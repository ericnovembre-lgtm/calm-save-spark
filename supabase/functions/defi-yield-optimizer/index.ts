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

    // Get user's active yield strategies
    const { data: strategies } = await supabaseClient
      .from('yield_strategies')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('auto_execute', true);

    if (!strategies || strategies.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active auto-execute strategies found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's current DeFi positions
    const { data: positions } = await supabaseClient
      .from('defi_positions')
      .select('*')
      .eq('user_id', user.id);

    const opportunities = [];

    // Mock yield data from various protocols (in production, fetch from APIs)
    const protocolYields = {
      'aave': { 'USDC': 3.5, 'DAI': 4.2, 'USDT': 3.8 },
      'compound': { 'USDC': 2.9, 'DAI': 3.1, 'USDT': 2.7 },
    };

    for (const strategy of strategies) {
      const targetAPYMin = strategy.target_apy_min || 0;
      const rebalanceThreshold = strategy.rebalance_threshold || 1.0;

      for (const protocol of strategy.target_protocols) {
        const yields = protocolYields[protocol as keyof typeof protocolYields];
        if (!yields) continue;

        for (const [asset, apy] of Object.entries(yields)) {
          if (apy >= targetAPYMin) {
            // Check if user has position in this asset
            const currentPosition = positions?.find(
              p => p.asset_symbol === asset && p.protocol === protocol
            );

            if (currentPosition && currentPosition.apy) {
              const apyDiff = apy - currentPosition.apy;
              
              // Only recommend if yield improvement exceeds threshold
              if (apyDiff >= rebalanceThreshold) {
                opportunities.push({
                  strategy_id: strategy.id,
                  current_protocol: currentPosition.protocol,
                  target_protocol: protocol,
                  asset: asset,
                  current_apy: currentPosition.apy,
                  target_apy: apy,
                  apy_improvement: apyDiff,
                  estimated_annual_gain: (currentPosition.current_value_usd * apyDiff) / 100,
                  action: 'rebalance',
                  risk_level: strategy.risk_level,
                });
              }
            } else if (!currentPosition) {
              // New opportunity - no current position
              opportunities.push({
                strategy_id: strategy.id,
                target_protocol: protocol,
                asset: asset,
                target_apy: apy,
                action: 'enter_position',
                risk_level: strategy.risk_level,
              });
            }
          }
        }
      }
    }

    // Sort by estimated gain
    opportunities.sort((a, b) => 
      (b.estimated_annual_gain || 0) - (a.estimated_annual_gain || 0)
    );

    return new Response(
      JSON.stringify({
        opportunities: opportunities.slice(0, 10), // Top 10 opportunities
        total_opportunities: opportunities.length,
        scan_timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in defi-yield-optimizer:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
