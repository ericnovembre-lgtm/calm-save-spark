-- Create rate limiting table for edge function calls
CREATE TABLE IF NOT EXISTS public.edge_function_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  call_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_function 
ON public.edge_function_rate_limits(user_id, function_name, window_start);

-- Enable RLS
ALTER TABLE public.edge_function_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own rate limit records
CREATE POLICY "Users can view own rate limits"
ON public.edge_function_rate_limits
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Service role can manage all records (for edge functions)
CREATE POLICY "Service role can manage rate limits"
ON public.edge_function_rate_limits
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Function to clean up old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.edge_function_rate_limits
  WHERE window_start < now() - INTERVAL '1 hour';
END;
$$;

-- Add updated_at trigger
CREATE TRIGGER update_rate_limits_updated_at
BEFORE UPDATE ON public.edge_function_rate_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();