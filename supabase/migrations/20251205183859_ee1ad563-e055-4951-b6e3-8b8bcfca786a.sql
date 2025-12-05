-- Offline transaction queue for storing transactions when offline
CREATE TABLE public.offline_transaction_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'synced', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.offline_transaction_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own offline queue"
  ON public.offline_transaction_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own offline queue"
  ON public.offline_transaction_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own offline queue"
  ON public.offline_transaction_queue FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own offline queue"
  ON public.offline_transaction_queue FOR DELETE
  USING (auth.uid() = user_id);

-- Mobile device tokens for native push notifications
CREATE TABLE public.mobile_device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_name TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, device_token)
);

-- Enable RLS
ALTER TABLE public.mobile_device_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own device tokens"
  ON public.mobile_device_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own device tokens"
  ON public.mobile_device_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own device tokens"
  ON public.mobile_device_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own device tokens"
  ON public.mobile_device_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Mobile app preferences
CREATE TABLE public.mobile_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  quick_glance_widgets TEXT[] DEFAULT ARRAY['balance', 'budget', 'goals'],
  default_camera_mode TEXT DEFAULT 'auto',
  haptic_enabled BOOLEAN DEFAULT true,
  haptic_intensity TEXT DEFAULT 'medium' CHECK (haptic_intensity IN ('light', 'medium', 'heavy')),
  voice_enabled BOOLEAN DEFAULT true,
  biometric_required_for_transactions BOOLEAN DEFAULT false,
  home_widget_order TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mobile_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own mobile preferences"
  ON public.mobile_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mobile preferences"
  ON public.mobile_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mobile preferences"
  ON public.mobile_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_mobile_preferences_updated_at
  BEFORE UPDATE ON public.mobile_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();