-- Create Deepseek quota state table for adaptive rate limiting
CREATE TABLE public.deepseek_quota_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requests_remaining_rpm INTEGER DEFAULT 60,
  requests_limit_rpm INTEGER DEFAULT 60,
  requests_reset_at TIMESTAMP WITH TIME ZONE,
  tokens_remaining_tpm INTEGER DEFAULT 1000000,
  tokens_limit_tpm INTEGER DEFAULT 1000000,
  tokens_reset_at TIMESTAMP WITH TIME ZONE,
  reasoning_tokens_used INTEGER DEFAULT 0,
  avg_latency_ms INTEGER DEFAULT 0,
  latency_samples INTEGER DEFAULT 0,
  consecutive_failures INTEGER DEFAULT 0,
  circuit_state TEXT DEFAULT 'closed',
  circuit_opened_at TIMESTAMP WITH TIME ZONE,
  last_request_at TIMESTAMP WITH TIME ZONE,
  total_cost_estimate NUMERIC(10, 6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deepseek_quota_state ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read quota state
CREATE POLICY "Anyone can read deepseek quota state"
ON public.deepseek_quota_state
FOR SELECT
USING (true);

-- Only service role can update
CREATE POLICY "Service role can update deepseek quota state"
ON public.deepseek_quota_state
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert initial state
INSERT INTO public.deepseek_quota_state (id) VALUES (gen_random_uuid());

-- Create function to update Deepseek quota state
CREATE OR REPLACE FUNCTION public.update_deepseek_quota_state(
  p_requests_remaining INTEGER,
  p_requests_limit INTEGER,
  p_requests_reset TIMESTAMP WITH TIME ZONE,
  p_tokens_remaining INTEGER,
  p_tokens_limit INTEGER,
  p_tokens_reset TIMESTAMP WITH TIME ZONE,
  p_reasoning_tokens INTEGER,
  p_latency_ms INTEGER,
  p_success BOOLEAN,
  p_cost_estimate NUMERIC
)
RETURNS deepseek_quota_state
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result deepseek_quota_state;
  v_new_avg INTEGER;
  v_new_samples INTEGER;
BEGIN
  SELECT 
    avg_latency_ms,
    latency_samples
  INTO v_new_avg, v_new_samples
  FROM deepseek_quota_state
  LIMIT 1;
  
  v_new_samples := COALESCE(v_new_samples, 0) + 1;
  v_new_avg := ((COALESCE(v_new_avg, 0) * (v_new_samples - 1)) + p_latency_ms) / v_new_samples;
  
  UPDATE deepseek_quota_state
  SET
    requests_remaining_rpm = COALESCE(p_requests_remaining, requests_remaining_rpm),
    requests_limit_rpm = COALESCE(p_requests_limit, requests_limit_rpm),
    requests_reset_at = COALESCE(p_requests_reset, requests_reset_at),
    tokens_remaining_tpm = COALESCE(p_tokens_remaining, tokens_remaining_tpm),
    tokens_limit_tpm = COALESCE(p_tokens_limit, tokens_limit_tpm),
    tokens_reset_at = COALESCE(p_tokens_reset, tokens_reset_at),
    reasoning_tokens_used = reasoning_tokens_used + COALESCE(p_reasoning_tokens, 0),
    avg_latency_ms = v_new_avg,
    latency_samples = v_new_samples,
    consecutive_failures = CASE WHEN p_success THEN 0 ELSE consecutive_failures + 1 END,
    total_cost_estimate = total_cost_estimate + COALESCE(p_cost_estimate, 0),
    last_request_at = NOW(),
    updated_at = NOW()
  WHERE true
  RETURNING * INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Create function to update circuit state
CREATE OR REPLACE FUNCTION public.update_deepseek_circuit_state(p_state TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE deepseek_quota_state
  SET
    circuit_state = p_state,
    circuit_opened_at = CASE WHEN p_state = 'open' THEN NOW() ELSE circuit_opened_at END,
    consecutive_failures = CASE WHEN p_state = 'closed' THEN 0 ELSE consecutive_failures END,
    updated_at = NOW()
  WHERE true;
END;
$$;