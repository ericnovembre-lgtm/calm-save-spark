-- Create 404 analytics table
CREATE TABLE IF NOT EXISTS public.page_not_found_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  attempted_url TEXT NOT NULL,
  referrer TEXT,
  suggestions_shown JSONB,
  suggestion_clicked TEXT,
  contextual_help_shown BOOLEAN DEFAULT false,
  recent_pages_count INTEGER DEFAULT 0,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for analytics queries
CREATE INDEX idx_page_not_found_analytics_created_at ON public.page_not_found_analytics(created_at DESC);
CREATE INDEX idx_page_not_found_analytics_attempted_url ON public.page_not_found_analytics(attempted_url);
CREATE INDEX idx_page_not_found_analytics_user_id ON public.page_not_found_analytics(user_id);

-- Create custom redirects table for admin management
CREATE TABLE IF NOT EXISTS public.custom_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for fast redirect lookups
CREATE INDEX idx_custom_redirects_from_path ON public.custom_redirects(from_path) WHERE is_active = true;
CREATE INDEX idx_custom_redirects_usage_count ON public.custom_redirects(usage_count DESC);

-- Enable RLS on both tables
ALTER TABLE public.page_not_found_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_redirects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_not_found_analytics
-- Anyone can insert (for tracking)
CREATE POLICY "Anyone can insert 404 analytics"
  ON public.page_not_found_analytics
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view 404 analytics"
  ON public.page_not_found_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS Policies for custom_redirects
-- Everyone can read active redirects (needed for redirect logic)
CREATE POLICY "Anyone can view active redirects"
  ON public.custom_redirects
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Only admins can manage redirects
CREATE POLICY "Admins can manage redirects"
  ON public.custom_redirects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Function to increment redirect usage
CREATE OR REPLACE FUNCTION public.increment_redirect_usage(redirect_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.custom_redirects
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = redirect_id;
END;
$$;

-- Trigger to update updated_at on custom_redirects
CREATE TRIGGER update_custom_redirects_updated_at
  BEFORE UPDATE ON public.custom_redirects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();