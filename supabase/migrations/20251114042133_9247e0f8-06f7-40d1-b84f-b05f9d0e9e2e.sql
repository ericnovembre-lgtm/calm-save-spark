
-- Fix SECURITY DEFINER view warning by recreating achievement_leaderboard view
-- Views in PostgreSQL don't have explicit SECURITY DEFINER, but this ensures 
-- the view is properly defined with current permissions

DROP VIEW IF EXISTS public.achievement_leaderboard CASCADE;

CREATE VIEW public.achievement_leaderboard 
WITH (security_invoker=true)
AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.avatar_url,
  COUNT(ua.id) as total_achievements,
  COALESCE(SUM(a.points), 0) as total_points,
  p.current_streak,
  RANK() OVER (ORDER BY COALESCE(SUM(a.points), 0) DESC) as rank
FROM profiles p
LEFT JOIN user_achievements ua ON p.id = ua.user_id
LEFT JOIN achievements a ON ua.achievement_id = a.id
GROUP BY p.id, p.full_name, p.avatar_url, p.current_streak;

-- Grant select permissions
GRANT SELECT ON public.achievement_leaderboard TO authenticated;
GRANT SELECT ON public.achievement_leaderboard TO anon;

-- Add comment documenting the security model
COMMENT ON VIEW public.achievement_leaderboard IS 
'Public leaderboard view showing user achievement rankings. Uses security_invoker to respect querying user permissions.';
