-- Function to update user streak on transfer
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_activity timestamp with time zone;
  days_since_activity integer;
BEGIN
  -- Get user's last activity date
  SELECT last_activity_date INTO last_activity
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Calculate days since last activity
  IF last_activity IS NOT NULL THEN
    days_since_activity := EXTRACT(DAY FROM (NOW() - last_activity));
  ELSE
    days_since_activity := 999; -- First activity
  END IF;

  -- Update streak based on activity gap
  IF days_since_activity = 0 THEN
    -- Same day, no change to streak
    UPDATE public.profiles
    SET last_activity_date = NOW()
    WHERE id = NEW.user_id;
  ELSIF days_since_activity = 1 THEN
    -- Consecutive day, increment streak
    UPDATE public.profiles
    SET 
      current_streak = COALESCE(current_streak, 0) + 1,
      last_activity_date = NOW()
    WHERE id = NEW.user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE public.profiles
    SET 
      current_streak = 1,
      last_activity_date = NOW()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update streak on transfer
DROP TRIGGER IF EXISTS update_streak_on_transfer ON public.transfer_history;
CREATE TRIGGER update_streak_on_transfer
AFTER INSERT ON public.transfer_history
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION public.update_user_streak();

-- Function to reset inactive streaks (called by daily cron)
CREATE OR REPLACE FUNCTION public.reset_inactive_streaks()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET current_streak = 0
  WHERE 
    last_activity_date IS NOT NULL 
    AND last_activity_date < NOW() - INTERVAL '1 day'
    AND current_streak > 0;
  
  -- Log the reset
  RAISE NOTICE 'Reset streaks for inactive users at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily streak reset at midnight UTC
SELECT cron.schedule(
  'reset-inactive-streaks',
  '0 0 * * *',
  $$SELECT public.reset_inactive_streaks()$$
);

-- Schedule weekly digest emails every Monday at 9 AM UTC
SELECT cron.schedule(
  'send-weekly-digests',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://gmnpjgelzsmcidwrwbcg.supabase.co/functions/v1/send-weekly-digests-batch',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbnBqZ2VsenNtY2lkd3J3YmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODE0MTEsImV4cCI6MjA3NzI1NzQxMX0.x6_XHaj_xM-OpJvynD2O6TurM3nA9-7xcB3B0krC3sM}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  ) as request_id;
  $$
);