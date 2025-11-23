-- Create account_balance_history table for sparklines
CREATE TABLE IF NOT EXISTS public.account_balance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast querying
CREATE INDEX IF NOT EXISTS idx_balance_history_account_date 
ON public.account_balance_history(account_id, recorded_at DESC);

-- Add APY and account_color columns to connected_accounts
ALTER TABLE public.connected_accounts 
ADD COLUMN IF NOT EXISTS apy NUMERIC DEFAULT 0.01,
ADD COLUMN IF NOT EXISTS account_color TEXT DEFAULT 'cyan';

-- Enable RLS on account_balance_history
ALTER TABLE public.account_balance_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for account_balance_history
CREATE POLICY "Users can view their own account balance history"
ON public.account_balance_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own account balance history"
ON public.account_balance_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own account balance history"
ON public.account_balance_history FOR UPDATE
USING (auth.uid() = user_id);