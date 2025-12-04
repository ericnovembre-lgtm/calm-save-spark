-- Phase 4: Advanced Financial Intelligence Tables

-- Retirement Plans table
CREATE TABLE IF NOT EXISTS public.retirement_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_age INTEGER NOT NULL,
  retirement_age INTEGER NOT NULL DEFAULT 65,
  target_retirement_income NUMERIC DEFAULT 0,
  current_savings NUMERIC DEFAULT 0,
  monthly_contribution NUMERIC DEFAULT 0,
  risk_tolerance TEXT DEFAULT 'moderate',
  social_security_estimate NUMERIC DEFAULT 0,
  ss_claiming_age INTEGER DEFAULT 67,
  monte_carlo_results JSONB DEFAULT '{}',
  withdrawal_strategy JSONB DEFAULT '{}',
  deepseek_reasoning JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.retirement_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own retirement plans"
  ON public.retirement_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own retirement plans"
  ON public.retirement_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own retirement plans"
  ON public.retirement_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own retirement plans"
  ON public.retirement_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Budget Optimization History table
CREATE TABLE IF NOT EXISTS public.budget_optimization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  optimization_type TEXT NOT NULL,
  input_data JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  reasoning_chain JSONB DEFAULT '{}',
  savings_potential NUMERIC DEFAULT 0,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budget_optimization_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own budget optimization history"
  ON public.budget_optimization_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budget optimization history"
  ON public.budget_optimization_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Portfolio Optimization History table
CREATE TABLE IF NOT EXISTS public.portfolio_optimization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  optimization_type TEXT NOT NULL,
  portfolio_data JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  risk_metrics JSONB DEFAULT '{}',
  tax_analysis JSONB DEFAULT '{}',
  reasoning_chain JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_optimization_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own portfolio optimization history"
  ON public.portfolio_optimization_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own portfolio optimization history"
  ON public.portfolio_optimization_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_retirement_plans_user_id ON public.retirement_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_optimization_history_user_id ON public.budget_optimization_history(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_optimization_history_user_id ON public.portfolio_optimization_history(user_id);