-- Add achievement_category enum
CREATE TYPE achievement_category AS ENUM (
  'savings_mastery',
  'goal_achiever', 
  'streak_champion',
  'financial_wellness',
  'automation_expert',
  'community_champion'
);

-- Add category and freeze_day_reward to achievements table
ALTER TABLE public.achievements
ADD COLUMN IF NOT EXISTS category achievement_category DEFAULT 'savings_mastery',
ADD COLUMN IF NOT EXISTS freeze_day_reward INTEGER DEFAULT 0;

-- Create achievement_collections table
CREATE TABLE IF NOT EXISTS public.achievement_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category achievement_category NOT NULL,
  icon TEXT DEFAULT 'trophy',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create achievement_leaderboard view for global rankings
CREATE OR REPLACE VIEW public.achievement_leaderboard AS
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

-- Add RLS policies for achievement_collections
ALTER TABLE public.achievement_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievement collections"
  ON public.achievement_collections FOR SELECT
  USING (true);

-- Create index for leaderboard performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_points ON public.user_achievements(user_id, earned_at);

-- Update check-achievements function to grant freeze days
CREATE OR REPLACE FUNCTION public.grant_freeze_day_reward(p_user_id UUID, p_freeze_days INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if inventory exists
  IF EXISTS (SELECT 1 FROM streak_freeze_inventory WHERE user_id = p_user_id) THEN
    -- Update existing inventory
    UPDATE streak_freeze_inventory
    SET freeze_days_available = freeze_days_available + p_freeze_days,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- Create new inventory
    INSERT INTO streak_freeze_inventory (user_id, freeze_days_available, freeze_days_used)
    VALUES (p_user_id, p_freeze_days, 0);
  END IF;
END;
$function$;

-- Populate some initial achievement collections
INSERT INTO public.achievement_collections (name, description, category, icon) VALUES
  ('Savings Starter', 'Begin your savings journey', 'savings_mastery', 'piggy-bank'),
  ('Goal Getter', 'Master goal setting and completion', 'goal_achiever', 'target'),
  ('Streak Master', 'Build and maintain consistent habits', 'streak_champion', 'flame'),
  ('Financial Guru', 'Achieve financial wellness', 'financial_wellness', 'trending-up'),
  ('Automation Pro', 'Set up smart automation', 'automation_expert', 'zap'),
  ('Community Leader', 'Engage with the community', 'community_champion', 'users')
ON CONFLICT DO NOTHING;

-- Update some existing achievements to have rewards and categories
UPDATE public.achievements 
SET category = 'savings_mastery', freeze_day_reward = 1
WHERE achievement_type = 'transfer_count' AND (requirement->>'count')::integer <= 5;

UPDATE public.achievements
SET category = 'savings_mastery', freeze_day_reward = 3
WHERE achievement_type = 'savings_amount' AND (requirement->>'amount')::numeric >= 1000;

UPDATE public.achievements
SET category = 'goal_achiever', freeze_day_reward = 2
WHERE achievement_type = 'goal_completed';

UPDATE public.achievements
SET category = 'streak_champion', freeze_day_reward = 5
WHERE achievement_type = 'streak_days' AND (requirement->>'days')::integer >= 30;