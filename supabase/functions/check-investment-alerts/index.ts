import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceAlert {
  id: string;
  user_id: string;
  symbol: string;
  asset_name: string | null;
  alert_type: 'above' | 'below' | 'percent_change';
  target_price: number | null;
  percent_threshold: number | null;
  current_price_at_creation: number | null;
}

interface AlertSettings {
  drift_threshold_percent: number;
  price_alert_notifications: boolean;
  market_event_alerts: boolean;
  volatility_alerts: boolean;
  volatility_threshold_percent: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting investment alerts check...');

    // 1. Check Price Target Alerts
    const { data: priceAlerts, error: alertsError } = await supabase
      .from('investment_price_alerts')
      .select('*')
      .eq('is_active', true)
      .eq('is_triggered', false);

    if (alertsError) {
      console.error('Error fetching price alerts:', alertsError);
    }

    const triggeredAlerts: string[] = [];

    if (priceAlerts && priceAlerts.length > 0) {
      for (const alert of priceAlerts as PriceAlert[]) {
        // Get current price from market data cache
        const { data: marketData } = await supabase
          .from('market_data_cache')
          .select('price')
          .eq('symbol', alert.symbol)
          .single();

        if (!marketData?.price) continue;

        const currentPrice = typeof marketData.price === 'string' 
          ? parseFloat(marketData.price) 
          : marketData.price;
        let shouldTrigger = false;
        let message = '';

        if (alert.alert_type === 'above' && alert.target_price) {
          shouldTrigger = currentPrice >= alert.target_price;
          message = `${alert.symbol} reached $${currentPrice.toFixed(2)} (target: $${alert.target_price})`;
        } else if (alert.alert_type === 'below' && alert.target_price) {
          shouldTrigger = currentPrice <= alert.target_price;
          message = `${alert.symbol} dropped to $${currentPrice.toFixed(2)} (target: $${alert.target_price})`;
        } else if (alert.alert_type === 'percent_change' && alert.percent_threshold && alert.current_price_at_creation) {
          const percentChange = ((currentPrice - alert.current_price_at_creation) / alert.current_price_at_creation) * 100;
          shouldTrigger = Math.abs(percentChange) >= alert.percent_threshold;
          message = `${alert.symbol} changed ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}% (threshold: ${alert.percent_threshold}%)`;
        }

        if (shouldTrigger) {
          // Mark alert as triggered
          await supabase
            .from('investment_price_alerts')
            .update({ is_triggered: true, triggered_at: new Date().toISOString() })
            .eq('id', alert.id);

          // Create user alert
          await supabase
            .from('user_alerts')
            .insert({
              user_id: alert.user_id,
              alert_type: 'price_target',
              title: `Price Alert: ${alert.asset_name || alert.symbol}`,
              message,
              severity: 'info',
              action_url: '/investments',
            });

          // Queue push notification
          await supabase
            .from('notification_queue')
            .insert({
              user_id: alert.user_id,
              notification_type: 'price_alert',
              subject: `🎯 Price Alert: ${alert.symbol}`,
              content: { message, symbol: alert.symbol, current_price: currentPrice },
              status: 'pending',
            });

          triggeredAlerts.push(alert.id);
          console.log(`Triggered alert ${alert.id}: ${message}`);
        }
      }
    }

    // 2. Check Portfolio Drift Alerts
    const { data: usersWithSettings } = await supabase
      .from('investment_alert_settings')
      .select('user_id, drift_threshold_percent')
      .eq('price_alert_notifications', true);

    const driftAlerts: string[] = [];

    if (usersWithSettings) {
      for (const userSettings of usersWithSettings as { user_id: string; drift_threshold_percent: number }[]) {
        // Get user's portfolio holdings
        const { data: holdings } = await supabase
          .from('portfolio_holdings')
          .select('symbol, quantity, average_cost')
          .eq('user_id', userSettings.user_id);

        if (!holdings || holdings.length === 0) continue;

        // Get user's target allocation
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('portfolio_allocation_target')
          .eq('user_id', userSettings.user_id)
          .single();

        if (!preferences?.portfolio_allocation_target) continue;

        // Calculate current allocation and drift
        const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.average_cost), 0);
        const driftingAssets: string[] = [];

        for (const holding of holdings) {
          const currentValue = holding.quantity * holding.average_cost;
          const currentPercent = (currentValue / totalValue) * 100;
          const targetPercent = preferences.portfolio_allocation_target[holding.symbol] || 0;
          const drift = Math.abs(currentPercent - targetPercent);

          if (drift > userSettings.drift_threshold_percent) {
            driftingAssets.push(`${holding.symbol} (${drift.toFixed(1)}% drift)`);
          }
        }

        if (driftingAssets.length > 0) {
          await supabase
            .from('user_alerts')
            .insert({
              user_id: userSettings.user_id,
              alert_type: 'portfolio_drift',
              title: '⚖️ Portfolio Drift Detected',
              message: `Your portfolio has drifted beyond ${userSettings.drift_threshold_percent}% threshold: ${driftingAssets.join(', ')}`,
              severity: 'warning',
              action_url: '/investments',
            });

          driftAlerts.push(userSettings.user_id);
          console.log(`Drift alert for user ${userSettings.user_id}: ${driftingAssets.length} assets`);
        }
      }
    }

    // 3. Check for Market Events (significant price movements)
    const { data: recentPrices } = await supabase
      .from('market_data_cache')
      .select('symbol, current_price, change_percent')
      .gte('last_updated', new Date(Date.now() - 3600000).toISOString()); // Last hour

    const significantMoves = recentPrices?.filter(p => 
      Math.abs(parseFloat(p.change_percent)) >= 5
    ) || [];

    if (significantMoves.length > 0) {
      // Get users with market event alerts enabled
      const { data: usersWithMarketAlerts } = await supabase
        .from('investment_alert_settings')
        .select('user_id')
        .eq('market_event_alerts', true);

      if (usersWithMarketAlerts) {
        for (const user of usersWithMarketAlerts) {
          for (const move of significantMoves) {
            const direction = parseFloat(move.change_percent) > 0 ? 'surged' : 'dropped';
            const message = `${move.symbol} ${direction} ${Math.abs(parseFloat(move.change_percent)).toFixed(1)}%`;

            await supabase
              .from('user_alerts')
              .insert({
                user_id: user.user_id,
                alert_type: 'market_event',
                title: '📈 Market Event',
                message,
                severity: 'info',
                action_url: '/investments',
              });
          }
        }
      }
    }

    console.log(`Alerts check complete: ${triggeredAlerts.length} price alerts, ${driftAlerts.length} drift alerts, ${significantMoves.length} market events`);

    return new Response(
      JSON.stringify({
        success: true,
        triggered_price_alerts: triggeredAlerts.length,
        drift_alerts: driftAlerts.length,
        market_events: significantMoves.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-investment-alerts:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
