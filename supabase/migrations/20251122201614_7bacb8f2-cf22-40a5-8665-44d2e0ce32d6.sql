-- Add merchant logos table for caching logo URLs
CREATE TABLE IF NOT EXISTS public.merchant_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  domain TEXT,
  fallback_color TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add zombie detection fields to detected_subscriptions
ALTER TABLE public.detected_subscriptions
ADD COLUMN IF NOT EXISTS last_usage_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS usage_count_last_30_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS zombie_score NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS zombie_flagged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS marked_for_cancellation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS marked_for_cancellation_at TIMESTAMP WITH TIME ZONE;

-- Create subscription usage events table for tracking
CREATE TABLE IF NOT EXISTS public.subscription_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.detected_subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  merchant TEXT NOT NULL,
  amount NUMERIC(10,2),
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.merchant_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for merchant_logos (public read, function write)
CREATE POLICY "merchant_logos_select_all" ON public.merchant_logos
  FOR SELECT USING (true);

CREATE POLICY "merchant_logos_insert_service" ON public.merchant_logos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "merchant_logos_update_service" ON public.merchant_logos
  FOR UPDATE USING (true);

-- RLS policies for subscription_usage_events
CREATE POLICY "subscription_usage_events_select_own" ON public.subscription_usage_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscription_usage_events_insert_service" ON public.subscription_usage_events
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_merchant_logos_merchant_name ON public.merchant_logos(merchant_name);
CREATE INDEX IF NOT EXISTS idx_detected_subscriptions_zombie_score ON public.detected_subscriptions(zombie_score DESC) WHERE zombie_score > 70;
CREATE INDEX IF NOT EXISTS idx_subscription_usage_events_subscription_id ON public.subscription_usage_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_events_user_merchant ON public.subscription_usage_events(user_id, merchant, transaction_date DESC);