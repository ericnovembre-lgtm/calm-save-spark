-- Fix update_grok_quota_state function - add WHERE true clause
CREATE OR REPLACE FUNCTION public.update_grok_quota_state(
  p_requests_remaining integer,
  p_requests_limit integer,
  p_requests_reset timestamp with time zone,
  p_tokens_remaining integer,
  p_tokens_limit integer,
  p_tokens_reset timestamp with time zone,
  p_latency_ms integer,
  p_success boolean,
  p_is_sentiment boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_avg INTEGER;
  v_current_samples INTEGER;
  v_new_avg INTEGER;
BEGIN
  SELECT avg_latency_ms, latency_samples INTO v_current_avg, v_current_samples
  FROM grok_quota_state LIMIT 1;

  IF v_current_samples >= 100 THEN
    v_new_avg := ((v_current_avg * 99) + p_latency_ms) / 100;
  ELSE
    v_new_avg := ((v_current_avg * v_current_samples) + p_latency_ms) / (v_current_samples + 1);
  END IF;

  UPDATE grok_quota_state SET
    requests_remaining_rpm = COALESCE(p_requests_remaining, requests_remaining_rpm),
    requests_limit_rpm = COALESCE(p_requests_limit, requests_limit_rpm),
    requests_reset_at = COALESCE(p_requests_reset, requests_reset_at),
    tokens_remaining_tpm = COALESCE(p_tokens_remaining, tokens_remaining_tpm),
    tokens_limit_tpm = COALESCE(p_tokens_limit, tokens_limit_tpm),
    tokens_reset_at = COALESCE(p_tokens_reset, tokens_reset_at),
    avg_latency_ms = v_new_avg,
    latency_samples = LEAST(v_current_samples + 1, 100),
    consecutive_failures = CASE WHEN p_success THEN 0 ELSE consecutive_failures + 1 END,
    last_request_at = now(),
    total_requests_count = total_requests_count + 1,
    sentiment_queries_count = CASE WHEN p_is_sentiment THEN sentiment_queries_count + 1 ELSE sentiment_queries_count END,
    total_cost_estimate = total_cost_estimate + 0.15,
    updated_at = now()
  WHERE true;
END;
$$;

-- Fix update_grok_circuit_state function - add WHERE true clause
CREATE OR REPLACE FUNCTION public.update_grok_circuit_state(p_state text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE grok_quota_state SET
    circuit_state = p_state,
    circuit_opened_at = CASE WHEN p_state = 'open' THEN now() ELSE circuit_opened_at END,
    consecutive_failures = CASE WHEN p_state = 'closed' THEN 0 ELSE consecutive_failures END,
    updated_at = now()
  WHERE true;
END;
$$;