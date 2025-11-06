-- Create table for tracking user milestones
CREATE TABLE public.user_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  milestone_type TEXT NOT NULL,
  milestone_name TEXT NOT NULL,
  milestone_description TEXT,
  milestone_icon TEXT DEFAULT 'trophy',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own milestones" 
ON public.user_milestones 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" 
ON public.user_milestones 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_milestones_user_id ON public.user_milestones(user_id);
CREATE INDEX idx_user_milestones_type ON public.user_milestones(milestone_type);

-- Create function to auto-track onboarding completion milestone
CREATE OR REPLACE FUNCTION public.track_onboarding_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.onboarding_completed = true AND (OLD.onboarding_completed IS NULL OR OLD.onboarding_completed = false) THEN
    INSERT INTO public.user_milestones (user_id, milestone_type, milestone_name, milestone_description, milestone_icon)
    VALUES (
      NEW.id,
      'onboarding_completed',
      'Journey Started',
      'Completed your $ave+ onboarding and set up your account',
      'rocket'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for onboarding completion
CREATE TRIGGER on_onboarding_complete
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.track_onboarding_milestone();

-- Create function to track goal milestones
CREATE OR REPLACE FUNCTION public.track_goal_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Check if this is the first goal
    IF (SELECT COUNT(*) FROM public.goals WHERE user_id = NEW.user_id) = 1 THEN
      INSERT INTO public.user_milestones (user_id, milestone_type, milestone_name, milestone_description, milestone_icon)
      VALUES (
        NEW.user_id,
        'first_goal',
        'First Goal Created',
        'Set your first savings goal and started your financial journey',
        'target'
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for first goal
CREATE TRIGGER on_first_goal_created
AFTER INSERT ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.track_goal_milestone();

-- Create function to track pot milestones
CREATE OR REPLACE FUNCTION public.track_pot_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Check if this is the first pot
    IF (SELECT COUNT(*) FROM public.pots WHERE user_id = NEW.user_id) = 1 THEN
      INSERT INTO public.user_milestones (user_id, milestone_type, milestone_name, milestone_description, milestone_icon)
      VALUES (
        NEW.user_id,
        'first_pot',
        'First Pot Created',
        'Created your first savings pot to organize your money',
        'piggy-bank'
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for first pot
CREATE TRIGGER on_first_pot_created
AFTER INSERT ON public.pots
FOR EACH ROW
EXECUTE FUNCTION public.track_pot_milestone();

-- Create function to track account connection milestone
CREATE OR REPLACE FUNCTION public.track_account_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Check if this is the first connected account
    IF (SELECT COUNT(*) FROM public.connected_accounts WHERE user_id = NEW.user_id) = 1 THEN
      INSERT INTO public.user_milestones (user_id, milestone_type, milestone_name, milestone_description, milestone_icon)
      VALUES (
        NEW.user_id,
        'first_account',
        'Account Connected',
        'Connected your first bank account to $ave+',
        'link'
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for first account connection
CREATE TRIGGER on_first_account_connected
AFTER INSERT ON public.connected_accounts
FOR EACH ROW
EXECUTE FUNCTION public.track_account_milestone();