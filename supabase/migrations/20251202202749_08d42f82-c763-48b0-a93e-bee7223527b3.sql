-- Digital Twin Analytics table for tracking simulation history and insights
CREATE TABLE public.digital_twin_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('simulation_run', 'chat_query', 'scenario_saved', 'insight_generated', 'scenario_created_nl')),
  model_used TEXT,
  response_time_ms INTEGER,
  token_count INTEGER,
  scenario_parameters JSONB,
  outcome_metrics JSONB,
  query_text TEXT,
  insight_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.digital_twin_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own analytics"
  ON public.digital_twin_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
  ON public.digital_twin_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX idx_digital_twin_analytics_user_id ON public.digital_twin_analytics(user_id);
CREATE INDEX idx_digital_twin_analytics_created_at ON public.digital_twin_analytics(created_at DESC);
CREATE INDEX idx_digital_twin_analytics_event_type ON public.digital_twin_analytics(event_type);