-- Groq API quota state tracking table (singleton pattern)
CREATE TABLE IF NOT EXISTS groq_quota_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Requests tracking
  requests_limit_rpd INTEGER DEFAULT 14400,
  requests_remaining_rpd INTEGER DEFAULT 14400,
  requests_reset_at TIMESTAMPTZ,
  -- Tokens tracking
  tokens_limit_tpm INTEGER DEFAULT 6000,
  tokens_remaining_tpm INTEGER DEFAULT 6000,
  tokens_reset_at TIMESTAMPTZ,
  -- Latency tracking
  avg_latency_ms INTEGER DEFAULT 0,
  latency_samples INTEGER DEFAULT 0,
  p95_latency_ms INTEGER DEFAULT 0,
  -- Circuit breaker state
  circuit_state TEXT DEFAULT 'closed' CHECK (circuit_state IN ('closed', 'open', 'half-open')),
  circuit_opened_at TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0,
  -- Last update
  last_request_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one row needed (singleton pattern)
CREATE UNIQUE INDEX IF NOT EXISTS idx_groq_quota_singleton ON groq_quota_state ((true));

-- Insert initial singleton row
INSERT INTO groq_quota_state (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE groq_quota_state ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions)
CREATE POLICY "Service role can manage quota state"
  ON groq_quota_state
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update quota state after each request
CREATE OR REPLACE FUNCTION update_groq_quota_state(
  p_requests_remaining INTEGER,
  p_requests_limit INTEGER,
  p_requests_reset TIMESTAMPTZ,
  p_tokens_remaining INTEGER,
  p_tokens_limit INTEGER,
  p_tokens_reset TIMESTAMPTZ,
  p_latency_ms INTEGER,
  p_success BOOLEAN
)
RETURNS groq_quota_state
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result groq_quota_state;
  v_new_avg INTEGER;
  v_new_samples INTEGER;
BEGIN
  -- Calculate new latency average
  SELECT 
    avg_latency_ms,
    latency_samples
  INTO v_new_avg, v_new_samples
  FROM groq_quota_state
  LIMIT 1;
  
  v_new_samples := COALESCE(v_new_samples, 0) + 1;
  v_new_avg := ((COALESCE(v_new_avg, 0) * (v_new_samples - 1)) + p_latency_ms) / v_new_samples;
  
  -- Update state
  UPDATE groq_quota_state
  SET
    requests_remaining_rpd = COALESCE(p_requests_remaining, requests_remaining_rpd),
    requests_limit_rpd = COALESCE(p_requests_limit, requests_limit_rpd),
    requests_reset_at = COALESCE(p_requests_reset, requests_reset_at),
    tokens_remaining_tpm = COALESCE(p_tokens_remaining, tokens_remaining_tpm),
    tokens_limit_tpm = COALESCE(p_tokens_limit, tokens_limit_tpm),
    tokens_reset_at = COALESCE(p_tokens_reset, tokens_reset_at),
    avg_latency_ms = v_new_avg,
    latency_samples = v_new_samples,
    consecutive_failures = CASE WHEN p_success THEN 0 ELSE consecutive_failures + 1 END,
    last_request_at = NOW(),
    updated_at = NOW()
  WHERE true
  RETURNING * INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Function to update circuit state
CREATE OR REPLACE FUNCTION update_groq_circuit_state(p_state TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE groq_quota_state
  SET
    circuit_state = p_state,
    circuit_opened_at = CASE WHEN p_state = 'open' THEN NOW() ELSE circuit_opened_at END,
    consecutive_failures = CASE WHEN p_state = 'closed' THEN 0 ELSE consecutive_failures END,
    updated_at = NOW()
  WHERE true;
END;
$$;