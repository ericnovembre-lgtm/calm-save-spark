-- Add weekly_digest_enabled column to notification_preferences if not exists
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS weekly_digest_enabled boolean DEFAULT true;

-- Update the update_user_streak function to include 24-hour grace period
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_profile RECORD;
  v_days_since_last_activity INTEGER;
BEGIN
  -- Only process completed transfers
  IF NEW.status != 'completed' THEN
    RETURN NEW;
  END IF;

  -- Get current profile data
  SELECT current_streak, last_activity_date
  INTO v_profile
  FROM profiles
  WHERE id = NEW.user_id;

  -- If no profile exists, skip
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Calculate days since last activity
  IF v_profile.last_activity_date IS NULL THEN
    v_days_since_last_activity := 999;
  ELSE
    v_days_since_last_activity := EXTRACT(DAY FROM (NOW() - v_profile.last_activity_date));
  END IF;

  -- Update streak logic with 24-hour grace period
  IF v_profile.last_activity_date IS NULL THEN
    -- First activity ever
    UPDATE profiles
    SET current_streak = 1,
        last_activity_date = NOW()
    WHERE id = NEW.user_id;
  ELSIF v_days_since_last_activity = 0 THEN
    -- Same day activity, just update timestamp
    UPDATE profiles
    SET last_activity_date = NOW()
    WHERE id = NEW.user_id;
  ELSIF v_days_since_last_activity = 1 THEN
    -- Next day activity, increment streak
    UPDATE profiles
    SET current_streak = COALESCE(current_streak, 0) + 1,
        last_activity_date = NOW()
    WHERE id = NEW.user_id;
  ELSIF v_days_since_last_activity = 2 AND 
        EXTRACT(EPOCH FROM (NOW() - v_profile.last_activity_date)) < 172800 THEN
    -- Within 48 hours (24-hour grace period after missing a day)
    -- Continue the streak
    UPDATE profiles
    SET current_streak = COALESCE(current_streak, 0) + 1,
        last_activity_date = NOW()
    WHERE id = NEW.user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE profiles
    SET current_streak = 1,
        last_activity_date = NOW()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;