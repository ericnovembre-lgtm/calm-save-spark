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

    // Get user's mandate
    const { data: mandate } = await supabaseClient
      .from('investment_mandates')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!mandate) {
      return new Response(
        JSON.stringify({ error: 'No investment mandate configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current portfolio
    const { data: holdings } = await supabaseClient
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', user.id);

    const results: {
      taxLossOpportunities: Array<{ symbol: string; loss: number; savings: number }>;
      rebalancingActions: Array<{ action: string; assetType: string; amount: number; reason: string }>;
      recommendations: Array<{ type: string; message: string; timestamp: string }>;
    } = {
      taxLossOpportunities: [],
      rebalancingActions: [],
      recommendations: [],
    };

    // 1. Tax-Loss Harvesting Detection
    if (mandate.tax_loss_harvest_enabled) {
      const minHarvest = Number(mandate.min_harvest_amount);
      
      for (const holding of holdings || []) {
        const unrealizedLoss = Number(holding.unrealized_gain_loss);
        
        if (unrealizedLoss < -minHarvest) {
          // Check for wash sale (simplified - 30 day rule)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const potentialTaxSavings = Math.abs(unrealizedLoss) * 0.30; // Assume 30% tax rate
          
          // Insert TLH opportunity
          const { error } = await supabaseClient
            .from('tax_loss_harvest_opportunities')
            .insert({
              user_id: user.id,
              holding_id: holding.id,
              symbol: holding.symbol,
              current_loss: unrealizedLoss,
              potential_tax_savings: potentialTaxSavings,
              replacement_symbol: `${holding.symbol}X`, // Simplified - would use real similar ETF
              wash_sale_risk: false,
              status: 'pending',
            });

          if (!error) {
            results.taxLossOpportunities.push({
              symbol: holding.symbol,
              loss: unrealizedLoss,
              savings: potentialTaxSavings,
            });
          }
        }
      }
    }

    // 2. Portfolio Rebalancing Check
    if (mandate.auto_rebalance_enabled && holdings && holdings.length > 0) {
      const totalValue = holdings.reduce((sum, h) => sum + Number(h.market_value || 0), 0);
      const targetAllocation = mandate.target_allocation as any;
      const threshold = Number(mandate.rebalancing_threshold) / 100;

      // Calculate current allocation
      const currentAllocation: any = {};
      for (const holding of holdings) {
        const type = holding.asset_type;
        if (!currentAllocation[type]) currentAllocation[type] = 0;
        currentAllocation[type] += Number(holding.market_value || 0);
      }

      // Check if rebalancing needed
      for (const [assetType, targetPercent] of Object.entries(targetAllocation)) {
        const currentValue = currentAllocation[assetType] || 0;
        const currentPercent = currentValue / totalValue;
        const targetPercentNum = Number(targetPercent) / 100;
        const drift = Math.abs(currentPercent - targetPercentNum);

        if (drift > threshold) {
          const action = currentPercent > targetPercentNum ? 'sell' : 'buy';
          const targetValue = totalValue * targetPercentNum;
          const diff = Math.abs(targetValue - currentValue);

          results.rebalancingActions.push({
            action,
            assetType,
            amount: diff,
            reason: `${assetType} allocation drifted ${(drift * 100).toFixed(1)}% from target`,
          });
        }
      }
    }

    // 3. Generate Recommendations
    results.recommendations.push({
      type: 'info',
      message: `Analyzed ${holdings?.length || 0} holdings`,
      timestamp: new Date().toISOString(),
    });

    if (results.taxLossOpportunities.length > 0) {
      results.recommendations.push({
        type: 'action',
        message: `Found ${results.taxLossOpportunities.length} tax-loss harvesting opportunities`,
        timestamp: new Date().toISOString(),
      });
    }

    if (results.rebalancingActions.length > 0) {
      results.recommendations.push({
        type: 'action',
        message: `Portfolio rebalancing recommended: ${results.rebalancingActions.length} actions`,
        timestamp: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in investment-manager:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
