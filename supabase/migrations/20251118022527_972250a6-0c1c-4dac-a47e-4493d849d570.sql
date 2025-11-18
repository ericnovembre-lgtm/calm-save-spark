-- Enhance detected_subscriptions table
ALTER TABLE public.detected_subscriptions
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
ADD COLUMN IF NOT EXISTS confidence NUMERIC DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paused_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.detected_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_date ON public.detected_subscriptions(user_id, next_expected_date);

-- Create subscription_events table for history tracking
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES detected_subscriptions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('detected', 'confirmed', 'paused', 'resumed', 'payment', 'modified', 'cancelled')),
  amount_cents BIGINT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_events_sub ON subscription_events(subscription_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON subscription_events(user_id, created_at DESC);

-- Enable RLS on subscription_events
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription events"
  ON subscription_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription events"
  ON subscription_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);