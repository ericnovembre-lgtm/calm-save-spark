-- User login sessions table with geo-location tracking
CREATE TABLE public.user_login_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  device_name TEXT, -- 'MacBook Pro', 'iPhone 15', etc.
  browser TEXT, -- 'Chrome 120', 'Safari Mobile', etc.
  os TEXT, -- 'macOS', 'iOS', 'Windows', etc.
  ip_address TEXT,
  city TEXT,
  country TEXT,
  country_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  is_current BOOLEAN DEFAULT false,
  is_authorized BOOLEAN DEFAULT true,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_login_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON public.user_login_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.user_login_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.user_login_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.user_login_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- User lockdown status table for persistence
CREATE TABLE public.user_lockdown_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_lockdown_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only see/manage their own lockdown status
CREATE POLICY "Users can view own lockdown status" ON public.user_lockdown_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lockdown status" ON public.user_lockdown_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lockdown status" ON public.user_lockdown_status
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_user_login_sessions_user_id ON public.user_login_sessions(user_id);
CREATE INDEX idx_user_login_sessions_last_active ON public.user_login_sessions(last_active_at DESC);
CREATE INDEX idx_user_lockdown_status_user_id ON public.user_lockdown_status(user_id);