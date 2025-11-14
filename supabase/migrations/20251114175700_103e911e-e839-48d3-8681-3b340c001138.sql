-- Create platform_stats table for real-time welcome page metrics
CREATE TABLE IF NOT EXISTS public.platform_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_key text NOT NULL UNIQUE,
  stat_value numeric NOT NULL DEFAULT 0,
  stat_metadata jsonb DEFAULT '{}'::jsonb,
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read platform stats (public data)
CREATE POLICY "Anyone can view platform stats"
  ON public.platform_stats
  FOR SELECT
  USING (true);

-- Only service role can update stats
CREATE POLICY "Service role can manage platform stats"
  ON public.platform_stats
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to update platform stats
CREATE OR REPLACE FUNCTION public.update_platform_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_users bigint;
  v_total_saved numeric;
  v_users_this_month bigint;
  v_users_this_week bigint;
  v_users_today bigint;
BEGIN
  -- Calculate total active users (users with profiles)
  SELECT COUNT(*) INTO v_total_users
  FROM profiles;
  
  -- Calculate total saved across all goals
  SELECT COALESCE(SUM(current_amount), 0) INTO v_total_saved
  FROM goals;
  
  -- Calculate users active this month
  SELECT COUNT(DISTINCT user_id) INTO v_users_this_month
  FROM goals
  WHERE created_at >= date_trunc('month', now());
  
  -- Calculate users active this week
  SELECT COUNT(DISTINCT user_id) INTO v_users_this_week
  FROM goals
  WHERE created_at >= date_trunc('week', now());
  
  -- Calculate users active today
  SELECT COUNT(DISTINCT user_id) INTO v_users_today
  FROM goals
  WHERE created_at >= date_trunc('day', now());
  
  -- Upsert stats
  INSERT INTO platform_stats (stat_key, stat_value, stat_metadata, last_updated)
  VALUES 
    ('total_users', v_total_users, '{}'::jsonb, now()),
    ('total_saved', v_total_saved, '{}'::jsonb, now()),
    ('users_this_month', v_users_this_month, '{}'::jsonb, now()),
    ('users_this_week', v_users_this_week, '{}'::jsonb, now()),
    ('users_today', v_users_today, '{}'::jsonb, now()),
    ('average_apy', 4.25, '{}'::jsonb, now())
  ON CONFLICT (stat_key) 
  DO UPDATE SET 
    stat_value = EXCLUDED.stat_value,
    stat_metadata = EXCLUDED.stat_metadata,
    last_updated = now();
END;
$$;

-- Insert initial platform stats
INSERT INTO public.platform_stats (stat_key, stat_value, stat_metadata)
VALUES 
  ('total_users', 50000, '{"suffix": "+", "label": "Active Savers"}'::jsonb),
  ('total_saved', 2100000, '{"suffix": "M+", "label": "Total Saved", "unit": "$"}'::jsonb),
  ('average_apy', 4.25, '{"suffix": "%", "label": "Average APY"}'::jsonb),
  ('users_this_month', 2340, '{"label": "This Month"}'::jsonb),
  ('users_this_week', 580, '{"label": "This Week"}'::jsonb),
  ('users_today', 120, '{"label": "Today"}'::jsonb)
ON CONFLICT (stat_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_stats_key ON public.platform_stats(stat_key);

COMMENT ON TABLE public.platform_stats IS 'Stores real-time platform statistics for welcome page display';
COMMENT ON FUNCTION public.update_platform_stats() IS 'Updates platform statistics based on current database state';