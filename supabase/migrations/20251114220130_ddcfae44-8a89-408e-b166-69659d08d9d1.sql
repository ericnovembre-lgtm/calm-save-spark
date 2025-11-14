-- Add show_dashboard_tutorial column to profiles table for post-onboarding tutorial trigger
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_dashboard_tutorial boolean DEFAULT false;

COMMENT ON COLUMN public.profiles.show_dashboard_tutorial IS 'Flag to show dashboard tutorial after completing onboarding';