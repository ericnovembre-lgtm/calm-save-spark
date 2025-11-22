-- Create insights_cache table for performance optimization
CREATE TABLE IF NOT EXISTS public.insights_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cache_key TEXT NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cache_key)
);

-- Enable RLS
ALTER TABLE public.insights_cache ENABLE ROW LEVEL SECURITY;

-- Users can only access their own cache
CREATE POLICY "Users can view their own cache"
  ON public.insights_cache
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cache"
  ON public.insights_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cache"
  ON public.insights_cache
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cache"
  ON public.insights_cache
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_insights_cache_user_key ON public.insights_cache(user_id, cache_key);
CREATE INDEX idx_insights_cache_expires ON public.insights_cache(expires_at);

-- Function to clean expired cache automatically
CREATE OR REPLACE FUNCTION public.clean_expired_insights_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.insights_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;