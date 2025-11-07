-- Add onboarding progress tracking column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_progress jsonb DEFAULT '{
  "welcome": null,
  "account": null,
  "goal": null,
  "automation": null,
  "complete": null
}'::jsonb;