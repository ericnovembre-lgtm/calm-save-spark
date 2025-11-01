-- Phase 4 & 5: Goals, Pots, and Automation

-- Create pots table for savings containers
CREATE TABLE IF NOT EXISTS public.pots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  icon TEXT DEFAULT 'piggy-bank',
  color TEXT DEFAULT 'blue',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on pots
ALTER TABLE public.pots ENABLE ROW LEVEL SECURITY;

-- Pots policies
CREATE POLICY "Users can view own pots" ON public.pots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pots" ON public.pots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pots" ON public.pots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pots" ON public.pots
  FOR DELETE USING (auth.uid() = user_id);

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'round_up', 'percentage_save', 'scheduled_transfer', 'goal_based'
  is_active BOOLEAN DEFAULT true,
  trigger_condition JSONB DEFAULT '{}',
  action_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on automation_rules
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

-- Automation rules policies
CREATE POLICY "Users can view own rules" ON public.automation_rules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rules" ON public.automation_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rules" ON public.automation_rules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rules" ON public.automation_rules
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at on pots
CREATE TRIGGER update_pots_updated_at
  BEFORE UPDATE ON public.pots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on automation_rules
CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();