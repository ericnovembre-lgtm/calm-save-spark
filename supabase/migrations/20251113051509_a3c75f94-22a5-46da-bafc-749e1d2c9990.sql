-- Create streak_freeze_inventory table
CREATE TABLE IF NOT EXISTS public.streak_freeze_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  freeze_days_available INTEGER NOT NULL DEFAULT 0,
  freeze_days_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create streak_freeze_usage table to track when freeze days are used
CREATE TABLE IF NOT EXISTS public.streak_freeze_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  freeze_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  freeze_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.streak_freeze_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_freeze_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own freeze inventory"
  ON public.streak_freeze_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own freeze inventory"
  ON public.streak_freeze_inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own freeze inventory"
  ON public.streak_freeze_inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own freeze usage"
  ON public.streak_freeze_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own freeze usage"
  ON public.streak_freeze_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add digest frequency to notification_preferences
ALTER TABLE public.notification_preferences
ADD COLUMN IF NOT EXISTS digest_frequency TEXT DEFAULT 'weekly' CHECK (digest_frequency IN ('daily', 'weekly', 'monthly', 'never'));

-- Create trigger for streak_freeze_inventory updated_at
CREATE TRIGGER update_streak_freeze_inventory_updated_at
  BEFORE UPDATE ON public.streak_freeze_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_streak_freeze_inventory_user_id ON public.streak_freeze_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_freeze_usage_user_id ON public.streak_freeze_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_freeze_usage_dates ON public.streak_freeze_usage(user_id, freeze_start_date, freeze_end_date);

-- Update reset_inactive_streaks function to check for active freeze days
CREATE OR REPLACE FUNCTION public.reset_inactive_streaks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles p
  SET current_streak = 0
  WHERE 
    p.last_activity_date IS NOT NULL 
    AND p.last_activity_date < NOW() - INTERVAL '1 day'
    AND p.current_streak > 0
    AND NOT EXISTS (
      SELECT 1 
      FROM public.streak_freeze_usage sfu
      WHERE sfu.user_id = p.id
        AND NOW() BETWEEN sfu.freeze_start_date AND sfu.freeze_end_date
    );
  
  RAISE NOTICE 'Reset streaks for inactive users at %', NOW();
END;
$function$;