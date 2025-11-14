-- Create IP blocking and security alerting tables

-- Table for blocked IPs
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL, -- 'excessive_validation_failures', 'rate_limit_abuse', 'manual_block'
  block_type TEXT NOT NULL DEFAULT 'temporary', -- 'temporary', 'permanent'
  blocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ, -- NULL for permanent blocks
  failure_count INTEGER DEFAULT 0,
  last_failure_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for security alert configurations
CREATE TABLE IF NOT EXISTS public.security_alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL UNIQUE, -- 'rate_limit_spike', 'validation_failures', 'error_pattern'
  threshold INTEGER NOT NULL,
  window_minutes INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT true,
  admin_emails TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for security alert history
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blocked_ips_address ON public.blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_expires ON public.blocked_ips(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON public.security_alerts(alert_type, triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_unresolved ON public.security_alerts(triggered_at DESC) WHERE resolved_at IS NULL;

-- Enable RLS
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Policies: Only admins can manage blocked IPs
CREATE POLICY "Admins can view blocked IPs"
ON public.blocked_ips
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage blocked IPs"
ON public.blocked_ips
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Service role can manage all
CREATE POLICY "Service role can manage blocked IPs"
ON public.blocked_ips
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Policies for alert configs
CREATE POLICY "Admins can view alert configs"
ON public.security_alert_configs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage alert configs"
ON public.security_alert_configs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Service role can manage alert configs"
ON public.security_alert_configs
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Policies for security alerts
CREATE POLICY "Admins can view security alerts"
ON public.security_alerts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Service role can manage security alerts"
ON public.security_alerts
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Function to check if IP is blocked
CREATE OR REPLACE FUNCTION public.is_ip_blocked(ip TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.blocked_ips
    WHERE ip_address = ip
    AND (
      expires_at IS NULL 
      OR expires_at > now()
    )
  );
END;
$$;

-- Function to clean up expired IP blocks
CREATE OR REPLACE FUNCTION public.cleanup_expired_ip_blocks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.blocked_ips
  WHERE expires_at IS NOT NULL
  AND expires_at < now();
  
  RAISE NOTICE 'Cleaned up expired IP blocks at %', NOW();
END;
$$;

-- Insert default alert configurations
INSERT INTO public.security_alert_configs (alert_type, threshold, window_minutes, admin_emails) VALUES
  ('rate_limit_spike', 100, 60, ARRAY[]::TEXT[]),
  ('validation_failures', 50, 60, ARRAY[]::TEXT[]),
  ('error_pattern', 25, 30, ARRAY[]::TEXT[]),
  ('blocked_ip_threshold', 10, 60, ARRAY[]::TEXT[])
ON CONFLICT (alert_type) DO NOTHING;

-- Add triggers for updated_at
CREATE TRIGGER update_blocked_ips_updated_at
BEFORE UPDATE ON public.blocked_ips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alert_configs_updated_at
BEFORE UPDATE ON public.security_alert_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();