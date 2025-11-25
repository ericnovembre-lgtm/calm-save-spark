-- Create credit_goals table
CREATE TABLE IF NOT EXISTS public.credit_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_score INTEGER NOT NULL CHECK (target_score >= 300 AND target_score <= 850),
  reason TEXT,
  target_date TIMESTAMP WITH TIME ZONE,
  starting_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.credit_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_goals
CREATE POLICY "Users can view their own credit goals"
  ON public.credit_goals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credit goals"
  ON public.credit_goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit goals"
  ON public.credit_goals
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credit goals"
  ON public.credit_goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add credit alert columns to notification_preferences
ALTER TABLE public.notification_preferences
ADD COLUMN IF NOT EXISTS credit_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS credit_score_alert_threshold INTEGER DEFAULT 10 CHECK (credit_score_alert_threshold >= 5 AND credit_score_alert_threshold <= 50);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_credit_goals_user_id ON public.credit_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_goals_is_achieved ON public.credit_goals(user_id, is_achieved) WHERE is_achieved = false;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credit_goals_updated_at
  BEFORE UPDATE ON public.credit_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();