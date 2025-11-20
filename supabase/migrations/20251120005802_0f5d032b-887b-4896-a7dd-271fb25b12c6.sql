-- Create proactive_insights table
CREATE TABLE public.proactive_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Insight classification
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'subscription_price_hike',
    'spending_spike',
    'budget_overrun',
    'duplicate_charge',
    'optimization_opportunity',
    'savings_opportunity',
    'debt_refinance',
    'goal_milestone'
  )),
  
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'urgent')),
  
  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Resolution
  resolution_action TEXT,
  resolution_data JSONB,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  
  -- Metadata
  related_entity_id UUID,
  related_entity_type TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Tracking
  viewed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.proactive_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own insights"
  ON public.proactive_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON public.proactive_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert insights"
  ON public.proactive_insights FOR INSERT
  WITH CHECK (true);

-- Index for real-time queries
CREATE INDEX idx_insights_user_unresolved 
  ON public.proactive_insights(user_id, is_resolved, created_at DESC)
  WHERE is_resolved = FALSE;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.proactive_insights;