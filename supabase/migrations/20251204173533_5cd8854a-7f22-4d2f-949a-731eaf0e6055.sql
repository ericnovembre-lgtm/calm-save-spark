-- Create grok_quota_state table for tracking xAI Grok API quota
CREATE TABLE grok_quota_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requests_limit_rpm INTEGER DEFAULT 60,
  requests_remaining_rpm INTEGER DEFAULT 60,
  requests_reset_at TIMESTAMPTZ,
  tokens_limit_tpm INTEGER DEFAULT 100000,
  tokens_remaining_tpm INTEGER DEFAULT 100000,
  tokens_reset_at TIMESTAMPTZ,
  avg_latency_ms INTEGER DEFAULT 0,
  latency_samples INTEGER DEFAULT 0,
  consecutive_failures INTEGER DEFAULT 0,
  circuit_state TEXT DEFAULT 'closed',
  circuit_opened_at TIMESTAMPTZ,
  last_request_at TIMESTAMPTZ,
  total_cost_estimate NUMERIC DEFAULT 0,
  total_requests_count INTEGER DEFAULT 0,
  sentiment_queries_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial row
INSERT INTO grok_quota_state (id) VALUES (gen_random_uuid());

-- Enable RLS
ALTER TABLE grok_quota_state ENABLE ROW LEVEL SECURITY;

-- Admin read policy
CREATE POLICY "Allow authenticated read access to grok_quota_state" ON grok_quota_state
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create function to update Grok quota state
CREATE OR REPLACE FUNCTION update_grok_quota_state(
  p_requests_remaining INTEGER,
  p_requests_limit INTEGER,
  p_requests_reset TIMESTAMPTZ,
  p_tokens_remaining INTEGER,
  p_tokens_limit INTEGER,
  p_tokens_reset TIMESTAMPTZ,
  p_latency_ms INTEGER,
  p_success BOOLEAN,
  p_is_sentiment BOOLEAN DEFAULT false
) RETURNS void AS $$
DECLARE
  v_current_avg INTEGER;
  v_current_samples INTEGER;
  v_new_avg INTEGER;
BEGIN
  -- Get current average
  SELECT avg_latency_ms, latency_samples INTO v_current_avg, v_current_samples
  FROM grok_quota_state LIMIT 1;

  -- Calculate new rolling average (last 100 samples)
  IF v_current_samples >= 100 THEN
    v_new_avg := ((v_current_avg * 99) + p_latency_ms) / 100;
  ELSE
    v_new_avg := ((v_current_avg * v_current_samples) + p_latency_ms) / (v_current_samples + 1);
  END IF;

  UPDATE grok_quota_state SET
    requests_remaining_rpm = COALESCE(p_requests_remaining, requests_remaining_rpm),
    requests_limit_rpm = COALESCE(p_requests_limit, requests_limit_rpm),
    requests_reset_at = COALESCE(p_requests_reset, requests_reset_at),
    tokens_remaining_rpm = COALESCE(p_tokens_remaining, tokens_remaining_tpm),
    tokens_limit_tpm = COALESCE(p_tokens_limit, tokens_limit_tpm),
    tokens_reset_at = COALESCE(p_tokens_reset, tokens_reset_at),
    avg_latency_ms = v_new_avg,
    latency_samples = LEAST(v_current_samples + 1, 100),
    consecutive_failures = CASE WHEN p_success THEN 0 ELSE consecutive_failures + 1 END,
    last_request_at = now(),
    total_requests_count = total_requests_count + 1,
    sentiment_queries_count = CASE WHEN p_is_sentiment THEN sentiment_queries_count + 1 ELSE sentiment_queries_count END,
    total_cost_estimate = total_cost_estimate + 0.15,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update Grok circuit state
CREATE OR REPLACE FUNCTION update_grok_circuit_state(p_state TEXT) RETURNS void AS $$
BEGIN
  UPDATE grok_quota_state SET
    circuit_state = p_state,
    circuit_opened_at = CASE WHEN p_state = 'open' THEN now() ELSE circuit_opened_at END,
    consecutive_failures = CASE WHEN p_state = 'closed' THEN 0 ELSE consecutive_failures END,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;