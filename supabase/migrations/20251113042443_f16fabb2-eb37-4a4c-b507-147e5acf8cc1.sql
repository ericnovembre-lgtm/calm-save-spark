-- Add preferred_currency and current_streak columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date timestamp with time zone;

-- Create index for better query performance on streak queries
CREATE INDEX IF NOT EXISTS idx_profiles_current_streak ON public.profiles(current_streak DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.preferred_currency IS 'User preferred currency for displaying amounts (USD, EUR, GBP, etc.)';
COMMENT ON COLUMN public.profiles.current_streak IS 'Current consecutive days streak for savings activities';
COMMENT ON COLUMN public.profiles.last_activity_date IS 'Last date user made a transfer or completed a savings activity';
