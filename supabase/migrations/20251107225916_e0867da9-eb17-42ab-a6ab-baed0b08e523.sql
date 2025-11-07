-- Add onboarding_quiz column to profiles table to store quiz responses
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_quiz JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.onboarding_quiz IS 'Stores user responses from onboarding intent survey: saving_goal, biggest_challenge, automation_preference';