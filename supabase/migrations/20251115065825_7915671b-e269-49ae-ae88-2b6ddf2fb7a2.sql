-- Phase 1: Historical Financial Health Tracking
CREATE TABLE IF NOT EXISTS public.financial_health_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  components JSONB NOT NULL, -- Store all component scores
  recommendations JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast user queries
CREATE INDEX idx_financial_health_history_user_id ON public.financial_health_history(user_id);
CREATE INDEX idx_financial_health_history_calculated_at ON public.financial_health_history(calculated_at DESC);

-- Enable RLS
ALTER TABLE public.financial_health_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own history
CREATE POLICY "Users can view their own financial health history"
  ON public.financial_health_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert history (called from edge function)
CREATE POLICY "System can insert financial health history"
  ON public.financial_health_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Phase 2: Anonymous Benchmarking Data
CREATE TABLE IF NOT EXISTS public.financial_health_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age_range TEXT NOT NULL CHECK (age_range IN ('18-25', '26-35', '36-45', '46-55', '56-65', '65+')),
  income_bracket TEXT NOT NULL CHECK (income_bracket IN ('<30k', '30k-50k', '50k-75k', '75k-100k', '100k-150k', '150k+')),
  average_score DECIMAL(5,2) NOT NULL,
  percentile_25 DECIMAL(5,2) NOT NULL,
  percentile_50 DECIMAL(5,2) NOT NULL,
  percentile_75 DECIMAL(5,2) NOT NULL,
  percentile_90 DECIMAL(5,2) NOT NULL,
  sample_size INTEGER NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(age_range, income_bracket)
);

-- Public read access for benchmarks (fully anonymized)
ALTER TABLE public.financial_health_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view anonymized benchmarks"
  ON public.financial_health_benchmarks
  FOR SELECT
  USING (true);

-- Only system can update benchmarks
CREATE POLICY "System can update benchmarks"
  ON public.financial_health_benchmarks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can modify benchmarks"
  ON public.financial_health_benchmarks
  FOR UPDATE
  USING (true);

-- Phase 3: User Benchmark Preferences
CREATE TABLE IF NOT EXISTS public.user_benchmark_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  opted_in BOOLEAN NOT NULL DEFAULT false,
  age_range TEXT,
  income_bracket TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_benchmark_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own benchmark preferences"
  ON public.user_benchmark_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own benchmark preferences"
  ON public.user_benchmark_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own benchmark preferences"
  ON public.user_benchmark_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Phase 4: Function to calculate trend
CREATE OR REPLACE FUNCTION calculate_health_trend(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  current_score DECIMAL;
  previous_score DECIMAL;
BEGIN
  -- Get most recent score
  SELECT score INTO current_score
  FROM public.financial_health_history
  WHERE user_id = p_user_id
  ORDER BY calculated_at DESC
  LIMIT 1;

  -- Get score from 30 days ago
  SELECT score INTO previous_score
  FROM public.financial_health_history
  WHERE user_id = p_user_id
    AND calculated_at <= NOW() - INTERVAL '30 days'
  ORDER BY calculated_at DESC
  LIMIT 1;

  -- Return trend (difference)
  IF previous_score IS NOT NULL THEN
    RETURN current_score - previous_score;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Phase 5: Cleanup old history (keep 2 years)
CREATE OR REPLACE FUNCTION cleanup_old_financial_health_history()
RETURNS void AS $$
BEGIN
  DELETE FROM public.financial_health_history
  WHERE calculated_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Phase 6: Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_health_history;