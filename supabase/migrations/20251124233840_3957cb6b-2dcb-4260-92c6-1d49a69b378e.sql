-- Enable realtime for wallet_transactions
ALTER TABLE public.wallet_transactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;

-- Create wallet_balance_history table for portfolio chart
CREATE TABLE public.wallet_balance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  wallet_id uuid REFERENCES public.wallets NOT NULL,
  total_balance_usd numeric NOT NULL,
  token_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_wallet_balance_history_user_id ON public.wallet_balance_history(user_id);
CREATE INDEX idx_wallet_balance_history_wallet_id ON public.wallet_balance_history(wallet_id);
CREATE INDEX idx_wallet_balance_history_recorded_at ON public.wallet_balance_history(recorded_at DESC);

-- Enable RLS
ALTER TABLE public.wallet_balance_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own balance history"
  ON public.wallet_balance_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balance history"
  ON public.wallet_balance_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);