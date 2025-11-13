-- Fix function search path for update_user_preferences_updated_at
DROP TRIGGER IF EXISTS user_preferences_updated_at ON public.user_preferences;
DROP FUNCTION IF EXISTS update_user_preferences_updated_at();

CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();