import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SentimentAlert {
  id: string;
  user_id: string;
  ticker: string;
  alert_type: string;
  threshold_value: number | null;
  from_state: string | null;
  to_state: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[check-sentiment-alerts] Starting sentiment alert check');

    // Get all unique tickers from active alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('sentiment_alerts')
      .select('*')
      .eq('is_active', true);

    if (alertsError) {
      throw new Error(`Failed to fetch alerts: ${alertsError.message}`);
    }

    if (!alerts || alerts.length === 0) {
      console.log('[check-sentiment-alerts] No active alerts found');
      return new Response(JSON.stringify({ message: 'No active alerts' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const uniqueTickers = [...new Set(alerts.map((a: SentimentAlert) => a.ticker))];
    console.log(`[check-sentiment-alerts] Checking ${uniqueTickers.length} tickers`);

    const triggeredAlerts: any[] = [];

    for (const ticker of uniqueTickers) {
      // Fetch current sentiment (this will also record to history via get-social-sentiment)
      const { data: currentSentiment, error: sentimentError } = await supabase.functions.invoke(
        'get-social-sentiment',
        { body: { ticker } }
      );

      if (sentimentError || !currentSentiment) {
        console.error(`[check-sentiment-alerts] Failed to fetch sentiment for ${ticker}`);
        continue;
      }

      // Get last recorded sentiment for this ticker (skip the one just recorded)
      const { data: lastHistory } = await supabase
        .from('sentiment_history')
        .select('*')
        .eq('ticker', ticker)
        .order('recorded_at', { ascending: false })
        .range(1, 1)
        .single();

      // Check alerts for this ticker
      const tickerAlerts = alerts.filter((a: SentimentAlert) => a.ticker === ticker);

      for (const alert of tickerAlerts) {
        let shouldTrigger = false;
        let alertMessage = '';

        if (lastHistory) {
          switch (alert.alert_type) {
            case 'sentiment_shift':
              const scoreDiff = Math.abs(currentSentiment.sentiment.score - lastHistory.score);
              if (scoreDiff >= (alert.threshold_value || 30)) {
                shouldTrigger = true;
                alertMessage = `${ticker} sentiment shifted by ${scoreDiff} points (${lastHistory.score} → ${currentSentiment.sentiment.score})`;
              }
              break;

            case 'state_change':
              if (lastHistory.label !== currentSentiment.sentiment.label) {
                const fromMatch = !alert.from_state || alert.from_state === lastHistory.label;
                const toMatch = !alert.to_state || alert.to_state === currentSentiment.sentiment.label;
                if (fromMatch && toMatch) {
                  shouldTrigger = true;
                  alertMessage = `${ticker} sentiment changed from ${lastHistory.label} to ${currentSentiment.sentiment.label}`;
                }
              }
              break;

            case 'volume_spike':
              const volumeOrder = ['low', 'moderate', 'high', 'viral'];
              const lastVolumeIdx = volumeOrder.indexOf(lastHistory.volume);
              const currentVolumeIdx = volumeOrder.indexOf(currentSentiment.volume);
              if (currentVolumeIdx > lastVolumeIdx && currentVolumeIdx >= 2) {
                shouldTrigger = true;
                alertMessage = `${ticker} volume spiked to ${currentSentiment.volume} (was ${lastHistory.volume})`;
              }
              break;

            case 'confidence_drop':
              const confidenceThreshold = alert.threshold_value || 70;
              if (lastHistory.confidence >= confidenceThreshold && currentSentiment.sentiment.confidence < confidenceThreshold) {
                shouldTrigger = true;
                alertMessage = `${ticker} confidence dropped below ${confidenceThreshold}% (now ${currentSentiment.sentiment.confidence}%)`;
              }
              break;
          }
        }

        if (shouldTrigger) {
          console.log(`[check-sentiment-alerts] Alert triggered: ${alertMessage}`);
          
          // Create smart_alert notification with correct schema (severity, data)
          await supabase.from('smart_alerts').insert({
            user_id: alert.user_id,
            alert_type: `sentiment_${alert.alert_type}`,
            title: `Sentiment Alert: ${ticker}`,
            message: alertMessage,
            severity: alert.alert_type === 'state_change' ? 'high' : 'medium',
            data: {
              ticker,
              alert_id: alert.id,
              previous: lastHistory ? {
                score: lastHistory.score,
                label: lastHistory.label,
                confidence: lastHistory.confidence,
                volume: lastHistory.volume,
              } : null,
              current: {
                score: currentSentiment.sentiment.score,
                label: currentSentiment.sentiment.label,
                confidence: currentSentiment.sentiment.confidence,
                volume: currentSentiment.volume,
              },
            },
          });

          // Update last_triggered_at
          await supabase
            .from('sentiment_alerts')
            .update({ last_triggered_at: new Date().toISOString() })
            .eq('id', alert.id);

          triggeredAlerts.push({
            alert_id: alert.id,
            ticker,
            message: alertMessage,
          });
        }
      }
    }

    console.log(`[check-sentiment-alerts] Completed. Triggered ${triggeredAlerts.length} alerts`);

    return new Response(JSON.stringify({ 
      success: true, 
      triggered: triggeredAlerts.length,
      alerts: triggeredAlerts,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[check-sentiment-alerts] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
