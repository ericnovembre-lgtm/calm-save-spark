-- Phase 3: Debt & Investment Tracking Tables

-- Debt tracking
CREATE TABLE public.debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  debt_name text NOT NULL,
  debt_type text CHECK (debt_type IN ('credit_card', 'student_loan', 'mortgage', 'personal_loan', 'auto_loan', 'other')),
  principal_amount numeric NOT NULL,
  current_balance numeric NOT NULL,
  interest_rate numeric NOT NULL,
  minimum_payment numeric,
  payment_due_date integer,
  payoff_strategy text CHECK (payoff_strategy IN ('avalanche', 'snowball', 'custom')),
  target_payoff_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Investment portfolio tracking
CREATE TABLE public.investment_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name text NOT NULL,
  account_type text CHECK (account_type IN ('brokerage', '401k', 'ira', 'roth_ira', 'stocks', 'crypto')),
  total_value numeric NOT NULL,
  cost_basis numeric,
  gains_losses numeric,
  holdings jsonb DEFAULT '[]',
  last_synced timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Credit score monitoring
CREATE TABLE public.credit_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 300 AND score <= 850),
  provider text NOT NULL,
  score_date timestamptz NOT NULL,
  change_from_previous integer,
  factors jsonb,
  created_at timestamptz DEFAULT now()
);

-- Debt payment history
CREATE TABLE public.debt_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id uuid NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_date timestamptz NOT NULL,
  principal_paid numeric NOT NULL,
  interest_paid numeric NOT NULL,
  remaining_balance numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for debts
CREATE POLICY "Users can view own debts"
  ON public.debts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debts"
  ON public.debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts"
  ON public.debts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts"
  ON public.debts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for investment_accounts
CREATE POLICY "Users can view own investments"
  ON public.investment_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments"
  ON public.investment_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments"
  ON public.investment_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments"
  ON public.investment_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for credit_scores
CREATE POLICY "Users can view own credit scores"
  ON public.credit_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit scores"
  ON public.credit_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for debt_payments
CREATE POLICY "Users can view own debt payments"
  ON public.debt_payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.debts
    WHERE debts.id = debt_payments.debt_id
    AND debts.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert debt payments"
  ON public.debt_payments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.debts
    WHERE debts.id = debt_payments.debt_id
    AND debts.user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_debts_user_id ON public.debts(user_id);
CREATE INDEX idx_investments_user_id ON public.investment_accounts(user_id);
CREATE INDEX idx_credit_scores_user_id ON public.credit_scores(user_id);
CREATE INDEX idx_credit_scores_date ON public.credit_scores(user_id, score_date DESC);
CREATE INDEX idx_debt_payments_debt_id ON public.debt_payments(debt_id);

-- Triggers for updated_at
CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON public.investment_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();