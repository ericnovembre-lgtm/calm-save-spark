-- Add column to store draft/partial onboarding data for persistence
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_draft_data JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.onboarding_draft_data IS 'Stores partial form data during onboarding for persistence across sessions (goal name, target amount, etc.)';