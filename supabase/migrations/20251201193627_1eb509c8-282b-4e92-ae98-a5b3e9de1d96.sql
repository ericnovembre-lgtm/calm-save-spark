-- Create api_response_cache table for storing cached responses
CREATE TABLE IF NOT EXISTS public.api_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  cache_type TEXT NOT NULL,
  user_id UUID,
  response_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_cache_key ON public.api_response_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON public.api_response_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_user ON public.api_response_cache(user_id);

-- Enable RLS
ALTER TABLE public.api_response_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own cached data
CREATE POLICY "Users can read own cache"
  ON public.api_response_cache
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Function: get_cached_response
CREATE OR REPLACE FUNCTION public.get_cached_response(p_cache_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Try to get cached response
  SELECT response_data INTO v_result
  FROM public.api_response_cache
  WHERE cache_key = p_cache_key
    AND expires_at > now();
  
  -- Increment hit count if found
  IF FOUND THEN
    UPDATE public.api_response_cache
    SET hit_count = hit_count + 1
    WHERE cache_key = p_cache_key;
  END IF;
  
  RETURN v_result;
END;
$$;

-- Function: set_cached_response
CREATE OR REPLACE FUNCTION public.set_cached_response(
  p_cache_key TEXT,
  p_cache_type TEXT,
  p_user_id UUID,
  p_response_data JSONB,
  p_ttl_seconds INTEGER DEFAULT 3600
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.api_response_cache (
    cache_key,
    cache_type,
    user_id,
    response_data,
    expires_at
  ) VALUES (
    p_cache_key,
    p_cache_type,
    p_user_id,
    p_response_data,
    now() + (p_ttl_seconds || ' seconds')::interval
  )
  ON CONFLICT (cache_key)
  DO UPDATE SET
    response_data = EXCLUDED.response_data,
    expires_at = EXCLUDED.expires_at,
    hit_count = 0;
END;
$$;

-- Function: calculate_financial_health_score
CREATE OR REPLACE FUNCTION public.calculate_financial_health_score(p_user_id UUID)
RETURNS TABLE(
  overall_score INTEGER,
  credit_component INTEGER,
  debt_component INTEGER,
  savings_component INTEGER,
  goals_component INTEGER,
  investment_component INTEGER,
  emergency_fund_component INTEGER,
  recommendations JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credit_score INTEGER := 0;
  v_debt_score INTEGER := 100;
  v_savings_score INTEGER := 0;
  v_goals_score INTEGER := 0;
  v_investment_score INTEGER := 0;
  v_emergency_score INTEGER := 0;
  v_overall INTEGER := 0;
  v_recommendations JSONB := '[]'::jsonb;
  
  v_total_debt NUMERIC := 0;
  v_total_savings NUMERIC := 0;
  v_monthly_income NUMERIC := 3000; -- Default estimate
  v_goal_progress NUMERIC := 0;
  v_active_goals INTEGER := 0;
BEGIN
  -- Calculate credit score component (0-100)
  SELECT COALESCE(score, 0) INTO v_credit_score
  FROM public.credit_scores
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  v_credit_score := LEAST(100, GREATEST(0, (v_credit_score - 300) / 5)); -- Scale 300-800 to 0-100
  
  -- Calculate debt component (lower debt = higher score)
  SELECT COALESCE(SUM(current_balance), 0) INTO v_total_debt
  FROM public.debts
  WHERE user_id = p_user_id AND is_active = true;
  
  IF v_total_debt = 0 THEN
    v_debt_score := 100;
  ELSE
    v_debt_score := GREATEST(0, 100 - (v_total_debt / v_monthly_income * 10));
  END IF;
  
  -- Calculate savings component
  SELECT COALESCE(SUM(current_amount), 0) INTO v_total_savings
  FROM public.pots
  WHERE user_id = p_user_id AND is_active = true;
  
  v_savings_score := LEAST(100, (v_total_savings / v_monthly_income) * 20);
  
  -- Calculate goals component
  SELECT 
    COUNT(*),
    COALESCE(AVG(current_amount / NULLIF(target_amount, 0) * 100), 0)
  INTO v_active_goals, v_goal_progress
  FROM public.goals
  WHERE user_id = p_user_id AND is_active = true;
  
  IF v_active_goals > 0 THEN
    v_goals_score := LEAST(100, v_goal_progress);
  END IF;
  
  -- Calculate investment component (placeholder)
  v_investment_score := 50; -- Neutral score if no investment data
  
  -- Calculate emergency fund component
  IF v_total_savings >= (v_monthly_income * 6) THEN
    v_emergency_score := 100;
  ELSIF v_total_savings >= (v_monthly_income * 3) THEN
    v_emergency_score := 75;
  ELSIF v_total_savings >= v_monthly_income THEN
    v_emergency_score := 50;
  ELSE
    v_emergency_score := (v_total_savings / v_monthly_income) * 50;
  END IF;
  
  -- Calculate overall score (weighted average)
  v_overall := (
    v_credit_score * 0.20 +
    v_debt_score * 0.20 +
    v_savings_score * 0.20 +
    v_goals_score * 0.15 +
    v_investment_score * 0.10 +
    v_emergency_score * 0.15
  )::INTEGER;
  
  -- Generate recommendations
  IF v_credit_score < 50 THEN
    v_recommendations := v_recommendations || '["Improve credit score by paying bills on time"]'::jsonb;
  END IF;
  
  IF v_debt_score < 60 THEN
    v_recommendations := v_recommendations || '["Focus on paying down high-interest debt"]'::jsonb;
  END IF;
  
  IF v_emergency_score < 50 THEN
    v_recommendations := v_recommendations || '["Build emergency fund to cover 3-6 months expenses"]'::jsonb;
  END IF;
  
  IF v_goals_score < 40 AND v_active_goals > 0 THEN
    v_recommendations := v_recommendations || '["Increase contributions to reach your savings goals"]'::jsonb;
  END IF;
  
  RETURN QUERY SELECT
    v_overall,
    v_credit_score,
    v_debt_score,
    v_savings_score,
    v_goals_score,
    v_investment_score,
    v_emergency_score,
    v_recommendations;
END;
$$;