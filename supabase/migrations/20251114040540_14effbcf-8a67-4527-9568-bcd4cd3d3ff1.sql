-- Create security monitoring tables

-- Table for tracking validation failures
CREATE TABLE IF NOT EXISTS public.security_validation_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  failure_type TEXT NOT NULL, -- 'invalid_format', 'out_of_range', 'missing_field', etc.
  field_name TEXT,
  attempted_value TEXT,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for tracking error patterns
CREATE TABLE IF NOT EXISTS public.security_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  error_code TEXT,
  error_type TEXT NOT NULL, -- 'auth_failure', 'rate_limit', 'validation', 'internal', etc.
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_validation_failures_function 
ON public.security_validation_failures(function_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_validation_failures_user 
ON public.security_validation_failures(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_logs_function 
ON public.security_error_logs(function_name, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_logs_user 
ON public.security_error_logs(user_id, last_seen_at DESC);

-- Enable RLS
ALTER TABLE public.security_validation_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_error_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Only admins can view security logs
CREATE POLICY "Admins can view validation failures"
ON public.security_validation_failures
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can view error logs"
ON public.security_error_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Service role can insert logs
CREATE POLICY "Service role can insert validation failures"
ON public.security_validation_failures
FOR INSERT
WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage error logs"
ON public.security_error_logs
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Function to clean up old security logs (older than 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.security_validation_failures
  WHERE created_at < now() - INTERVAL '30 days';
  
  DELETE FROM public.security_error_logs
  WHERE created_at < now() - INTERVAL '30 days';
  
  RAISE NOTICE 'Cleaned up old security logs at %', NOW();
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_error_logs_updated_at
BEFORE UPDATE ON public.security_error_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();