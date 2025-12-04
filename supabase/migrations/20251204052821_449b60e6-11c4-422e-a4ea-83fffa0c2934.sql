-- Create sentiment_alerts table for user-configured alert rules
CREATE TABLE public.sentiment_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ticker TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('sentiment_shift', 'state_change', 'volume_spike', 'confidence_drop')),
  threshold_value NUMERIC,
  from_state TEXT,
  to_state TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_triggered_at TIMESTAMPTZ,
  UNIQUE(user_id, ticker, alert_type)
);

-- Create sentiment_history table for tracking sentiment over time
CREATE TABLE public.sentiment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  score INTEGER NOT NULL,
  label TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  volume TEXT NOT NULL,
  trending_topics JSONB,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for efficient history lookups
CREATE INDEX idx_sentiment_history_ticker_time ON public.sentiment_history(ticker, recorded_at DESC);
CREATE INDEX idx_sentiment_alerts_user ON public.sentiment_alerts(user_id);
CREATE INDEX idx_sentiment_alerts_ticker ON public.sentiment_alerts(ticker);

-- Enable RLS
ALTER TABLE public.sentiment_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for sentiment_alerts
CREATE POLICY "Users can view their own sentiment alerts"
  ON public.sentiment_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sentiment alerts"
  ON public.sentiment_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sentiment alerts"
  ON public.sentiment_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sentiment alerts"
  ON public.sentiment_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for sentiment_history (read-only for authenticated users)
CREATE POLICY "Authenticated users can view sentiment history"
  ON public.sentiment_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert sentiment history"
  ON public.sentiment_history FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add sentiment_alerts column to notification_preferences if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_preferences') THEN
    ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS sentiment_alerts BOOLEAN DEFAULT true;
  END IF;
END $$;