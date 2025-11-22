-- Create budget_inflation_alerts table
CREATE TABLE IF NOT EXISTS public.budget_inflation_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id UUID NOT NULL REFERENCES public.user_budgets(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  old_budget DECIMAL(10, 2) NOT NULL,
  suggested_budget DECIMAL(10, 2) NOT NULL,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected', 'dismissed'))
);

-- Create budget_transfer_log table
CREATE TABLE IF NOT EXISTS public.budget_transfer_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_budget_id UUID NOT NULL REFERENCES public.user_budgets(id) ON DELETE CASCADE,
  to_budget_id UUID NOT NULL REFERENCES public.user_budgets(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add last_rebalanced_at column to user_budgets
ALTER TABLE public.user_budgets 
ADD COLUMN IF NOT EXISTS last_rebalanced_at TIMESTAMPTZ;

-- Enable RLS
ALTER TABLE public.budget_inflation_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_transfer_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_inflation_alerts
CREATE POLICY "Users can view their own inflation alerts"
ON public.budget_inflation_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own inflation alerts"
ON public.budget_inflation_alerts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert inflation alerts"
ON public.budget_inflation_alerts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for budget_transfer_log
CREATE POLICY "Users can view their own transfer logs"
ON public.budget_transfer_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create transfer logs"
ON public.budget_transfer_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_budget_inflation_alerts_user_id ON public.budget_inflation_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_inflation_alerts_status ON public.budget_inflation_alerts(status);
CREATE INDEX IF NOT EXISTS idx_budget_transfer_log_user_id ON public.budget_transfer_log(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_transfer_log_from_budget ON public.budget_transfer_log(from_budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_transfer_log_to_budget ON public.budget_transfer_log(to_budget_id);