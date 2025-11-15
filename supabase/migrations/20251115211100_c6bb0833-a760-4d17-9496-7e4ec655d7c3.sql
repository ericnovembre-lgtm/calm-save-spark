-- Create budget_categories table for master category definitions
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'tag',
  color TEXT DEFAULT '#6366f1',
  is_custom BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT custom_category_has_user CHECK (
    (is_custom = false AND user_id IS NULL) OR
    (is_custom = true AND user_id IS NOT NULL)
  )
);

-- Create budget_spending table for real-time spending tracking
CREATE TABLE IF NOT EXISTS public.budget_spending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id UUID NOT NULL REFERENCES public.user_budgets(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  spent_amount NUMERIC(12, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(budget_id, period_start, period_end)
);

-- Create budget_rules table for auto-categorization
CREATE TABLE IF NOT EXISTS public.budget_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id UUID NOT NULL REFERENCES public.user_budgets(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('merchant', 'keyword', 'amount_range')),
  pattern TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create budget_onboarding table for tracking user onboarding progress
CREATE TABLE IF NOT EXISTS public.budget_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  first_budget_created BOOLEAN DEFAULT false,
  first_category_added BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create budget_analytics table for historical data and trends
CREATE TABLE IF NOT EXISTS public.budget_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id UUID NOT NULL REFERENCES public.user_budgets(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('monthly', 'weekly', 'annual')),
  period_date DATE NOT NULL,
  budgeted NUMERIC(12, 2) NOT NULL,
  spent NUMERIC(12, 2) DEFAULT 0,
  variance NUMERIC(12, 2) GENERATED ALWAYS AS (budgeted - spent) STORED,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(budget_id, period, period_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_budget_categories_user ON public.budget_categories(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_budget_categories_code ON public.budget_categories(code);
CREATE INDEX IF NOT EXISTS idx_budget_spending_user ON public.budget_spending(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_spending_budget ON public.budget_spending(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_spending_period ON public.budget_spending(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_budget_rules_user ON public.budget_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_rules_budget ON public.budget_rules(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_rules_active ON public.budget_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_budget_onboarding_user ON public.budget_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_analytics_user ON public.budget_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_analytics_budget ON public.budget_analytics(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_analytics_period ON public.budget_analytics(period_date);

-- Enable RLS on all tables
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_spending ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_categories
CREATE POLICY "Users can view system categories"
  ON public.budget_categories FOR SELECT
  USING (is_custom = false OR user_id = auth.uid());

CREATE POLICY "Users can create custom categories"
  ON public.budget_categories FOR INSERT
  WITH CHECK (is_custom = true AND user_id = auth.uid());

CREATE POLICY "Users can update own custom categories"
  ON public.budget_categories FOR UPDATE
  USING (is_custom = true AND user_id = auth.uid());

CREATE POLICY "Users can delete own custom categories"
  ON public.budget_categories FOR DELETE
  USING (is_custom = true AND user_id = auth.uid());

-- RLS Policies for budget_spending
CREATE POLICY "Users can view own budget spending"
  ON public.budget_spending FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own budget spending"
  ON public.budget_spending FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own budget spending"
  ON public.budget_spending FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own budget spending"
  ON public.budget_spending FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for budget_rules
CREATE POLICY "Users can manage own budget rules"
  ON public.budget_rules FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for budget_onboarding
CREATE POLICY "Users can manage own onboarding data"
  ON public.budget_onboarding FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for budget_analytics
CREATE POLICY "Users can view own budget analytics"
  ON public.budget_analytics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own budget analytics"
  ON public.budget_analytics FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own budget analytics"
  ON public.budget_analytics FOR UPDATE
  USING (user_id = auth.uid());

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_budget_spending_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for budget_spending updates
CREATE TRIGGER update_budget_spending_timestamp_trigger
  BEFORE UPDATE ON public.budget_spending
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_spending_timestamp();

-- Insert default system budget categories
INSERT INTO public.budget_categories (code, name, icon, color, is_custom) VALUES
  ('housing', 'Housing', 'home', '#3b82f6', false),
  ('food', 'Food & Dining', 'utensils', '#10b981', false),
  ('transportation', 'Transportation', 'car', '#f59e0b', false),
  ('utilities', 'Utilities', 'zap', '#8b5cf6', false),
  ('healthcare', 'Healthcare', 'heart', '#ec4899', false),
  ('entertainment', 'Entertainment', 'film', '#14b8a6', false),
  ('shopping', 'Shopping', 'shopping-bag', '#ef4444', false),
  ('personal', 'Personal Care', 'user', '#06b6d4', false),
  ('education', 'Education', 'book', '#6366f1', false),
  ('savings', 'Savings', 'piggy-bank', '#84cc16', false),
  ('debt', 'Debt Payments', 'credit-card', '#f97316', false),
  ('other', 'Other', 'more-horizontal', '#64748b', false)
ON CONFLICT (code) DO NOTHING;