-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create financial_health_scores table
CREATE TABLE IF NOT EXISTS financial_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  overall_score INTEGER NOT NULL,
  credit_score_component INTEGER,
  debt_component INTEGER,
  savings_component INTEGER,
  goals_component INTEGER,
  investment_component INTEGER,
  emergency_fund_component INTEGER,
  recommendations JSONB DEFAULT '[]'::jsonb,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_score CHECK (overall_score >= 0 AND overall_score <= 100)
);

-- Enable RLS
ALTER TABLE financial_health_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own health scores"
  ON financial_health_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert health scores"
  ON financial_health_scores FOR INSERT
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_financial_health_user_date 
  ON financial_health_scores(user_id, calculated_at DESC);

-- Schedule investment sync every hour
SELECT cron.schedule(
  'sync-investments-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://gmnpjgelzsmcidwrwbcg.supabase.co/functions/v1/sync-investments',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbnBqZ2VsenNtY2lkd3J3YmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODE0MTEsImV4cCI6MjA3NzI1NzQxMX0.x6_XHaj_xM-OpJvynD2O6TurM3nA9-7xcB3B0krC3sM"}'::jsonb,
    body:='{"cron": true}'::jsonb
  ) as request_id;
  $$
);

-- Schedule credit score sync every hour (at 30 minutes past the hour)
SELECT cron.schedule(
  'sync-credit-scores-hourly',
  '30 * * * *',
  $$
  SELECT net.http_post(
    url:='https://gmnpjgelzsmcidwrwbcg.supabase.co/functions/v1/credit-score-sync',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbnBqZ2VsenNtY2lkd3J3YmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODE0MTEsImV4cCI6MjA3NzI1NzQxMX0.x6_XHaj_xM-OpJvynD2O6TurM3nA9-7xcB3B0krC3sM"}'::jsonb,
    body:='{"cron": true}'::jsonb
  ) as request_id;
  $$
);