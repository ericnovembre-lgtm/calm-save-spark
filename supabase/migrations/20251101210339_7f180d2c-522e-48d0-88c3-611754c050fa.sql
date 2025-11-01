-- Phase 2: AI Coaching & Predictive Analytics Tables

-- AI coaching sessions
CREATE TABLE public.ai_coaching_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text CHECK (session_type IN ('general', 'budgeting', 'debt', 'savings', 'investment')),
  message_count integer DEFAULT 0,
  conversation_history jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now()
);

-- User budgets
CREATE TABLE public.user_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  period text NOT NULL CHECK (period IN ('weekly', 'monthly', 'annual')),
  total_limit numeric NOT NULL,
  category_limits jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Budget templates
CREATE TABLE public.budget_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  income_level text CHECK (income_level IN ('low', 'medium', 'high')),
  category_percentages jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_coaching_sessions
CREATE POLICY "Users can view own sessions"
  ON public.ai_coaching_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.ai_coaching_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.ai_coaching_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_budgets
CREATE POLICY "Users can view own budgets"
  ON public.user_budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON public.user_budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON public.user_budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON public.user_budgets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for budget_templates (public read)
CREATE POLICY "Anyone can view templates"
  ON public.budget_templates FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX idx_ai_sessions_user ON public.ai_coaching_sessions(user_id);
CREATE INDEX idx_budgets_user ON public.user_budgets(user_id);

-- Trigger for budget updates
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.user_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default budget templates
INSERT INTO public.budget_templates (name, description, income_level, category_percentages) VALUES
('50/30/20 Rule', 'Classic budgeting rule: 50% needs, 30% wants, 20% savings', 'medium', '{
  "needs": 50,
  "wants": 30,
  "savings": 20
}'::jsonb),
('Conservative', 'Focus on savings and security', 'medium', '{
  "housing": 25,
  "food": 15,
  "transportation": 10,
  "utilities": 5,
  "savings": 30,
  "discretionary": 15
}'::jsonb),
('Student Budget', 'Budget optimized for students', 'low', '{
  "housing": 35,
  "food": 20,
  "transportation": 10,
  "education": 15,
  "entertainment": 10,
  "savings": 10
}'::jsonb);