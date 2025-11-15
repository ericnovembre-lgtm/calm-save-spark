-- Create synthetic_paychecks table for Business-of-One OS
CREATE TABLE IF NOT EXISTS public.synthetic_paychecks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  total_income NUMERIC NOT NULL DEFAULT 0,
  withholding_federal NUMERIC NOT NULL DEFAULT 0,
  withholding_state NUMERIC NOT NULL DEFAULT 0,
  withholding_fica NUMERIC NOT NULL DEFAULT 0,
  net_paycheck NUMERIC NOT NULL DEFAULT 0,
  calculation_method TEXT NOT NULL DEFAULT 'average_3_months',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loan_rate_alerts table for Refinancing Hub
CREATE TABLE IF NOT EXISTS public.loan_rate_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  debt_id UUID REFERENCES public.debts(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL,
  current_rate NUMERIC NOT NULL,
  alert_threshold NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lifesim_turns table for LifeSim game tracking
CREATE TABLE IF NOT EXISTS public.lifesim_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.lifesim_game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  age INTEGER NOT NULL,
  net_worth NUMERIC NOT NULL DEFAULT 0,
  income NUMERIC NOT NULL DEFAULT 0,
  debt NUMERIC NOT NULL DEFAULT 0,
  investments NUMERIC NOT NULL DEFAULT 0,
  financial_state JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.synthetic_paychecks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_rate_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifesim_turns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for synthetic_paychecks
CREATE POLICY "Users can view own paychecks" ON public.synthetic_paychecks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own paychecks" ON public.synthetic_paychecks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own paychecks" ON public.synthetic_paychecks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own paychecks" ON public.synthetic_paychecks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for loan_rate_alerts
CREATE POLICY "Users can view own loan alerts" ON public.loan_rate_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loan alerts" ON public.loan_rate_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loan alerts" ON public.loan_rate_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own loan alerts" ON public.loan_rate_alerts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for lifesim_turns
CREATE POLICY "Users can view own game turns" ON public.lifesim_turns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game turns" ON public.lifesim_turns FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_synthetic_paychecks_user_id ON public.synthetic_paychecks(user_id);
CREATE INDEX idx_synthetic_paychecks_period ON public.synthetic_paychecks(period_start, period_end);
CREATE INDEX idx_loan_rate_alerts_user_id ON public.loan_rate_alerts(user_id);
CREATE INDEX idx_loan_rate_alerts_debt_id ON public.loan_rate_alerts(debt_id);
CREATE INDEX idx_lifesim_turns_session_id ON public.lifesim_turns(session_id);
CREATE INDEX idx_lifesim_turns_user_id ON public.lifesim_turns(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_synthetic_paychecks_updated_at BEFORE UPDATE ON public.synthetic_paychecks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_rate_alerts_updated_at BEFORE UPDATE ON public.loan_rate_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();