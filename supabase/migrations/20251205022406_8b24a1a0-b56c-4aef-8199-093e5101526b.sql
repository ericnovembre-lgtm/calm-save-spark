-- Create widget analytics table for tracking user engagement
CREATE TABLE public.widget_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  widget_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  action_name TEXT,
  duration_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.widget_analytics ENABLE ROW LEVEL SECURITY;

-- Users can insert their own analytics
CREATE POLICY "Users can insert own widget analytics"
ON public.widget_analytics FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own analytics
CREATE POLICY "Users can view own widget analytics"
ON public.widget_analytics FOR SELECT
USING (auth.uid() = user_id);

-- Index for fast queries
CREATE INDEX idx_widget_analytics_user_widget ON public.widget_analytics(user_id, widget_id, created_at DESC);
CREATE INDEX idx_widget_analytics_event_type ON public.widget_analytics(user_id, event_type, created_at DESC);