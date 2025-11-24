-- Investment Price Alerts Table
CREATE TABLE IF NOT EXISTS public.investment_price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  asset_name TEXT,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('above', 'below', 'percent_change')),
  target_price NUMERIC,
  percent_threshold NUMERIC,
  current_price_at_creation NUMERIC,
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  note TEXT,
  CONSTRAINT valid_target CHECK (
    (alert_type IN ('above', 'below') AND target_price IS NOT NULL) OR
    (alert_type = 'percent_change' AND percent_threshold IS NOT NULL)
  )
);

-- Investment Alert Settings Table
CREATE TABLE IF NOT EXISTS public.investment_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  drift_threshold_percent NUMERIC DEFAULT 5 CHECK (drift_threshold_percent BETWEEN 1 AND 50),
  daily_portfolio_summary BOOLEAN DEFAULT true,
  price_alert_notifications BOOLEAN DEFAULT true,
  market_event_alerts BOOLEAN DEFAULT true,
  volatility_alerts BOOLEAN DEFAULT true,
  volatility_threshold_percent NUMERIC DEFAULT 10 CHECK (volatility_threshold_percent BETWEEN 5 AND 50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investment_price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_alert_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investment_price_alerts
CREATE POLICY "Users can view their own price alerts"
  ON public.investment_price_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own price alerts"
  ON public.investment_price_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price alerts"
  ON public.investment_price_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price alerts"
  ON public.investment_price_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for investment_alert_settings
CREATE POLICY "Users can view their own alert settings"
  ON public.investment_alert_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alert settings"
  ON public.investment_alert_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert settings"
  ON public.investment_alert_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_investment_price_alerts_user_active 
  ON public.investment_price_alerts(user_id, is_active, is_triggered);

CREATE INDEX idx_investment_price_alerts_symbol 
  ON public.investment_price_alerts(symbol) WHERE is_active = true;

-- Enable Realtime for instant notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.investment_price_alerts;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_investment_alert_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_investment_alert_settings_timestamp
  BEFORE UPDATE ON public.investment_alert_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_investment_alert_settings_timestamp();