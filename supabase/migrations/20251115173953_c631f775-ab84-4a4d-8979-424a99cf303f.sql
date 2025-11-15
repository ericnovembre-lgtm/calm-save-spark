-- Create wallets table
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chain TEXT NOT NULL DEFAULT 'ethereum',
  address TEXT NOT NULL,
  encrypted_key_share TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, chain)
);

-- Create wallet_transactions table
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  token_symbol TEXT NOT NULL DEFAULT 'ETH',
  token_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  gas_used NUMERIC,
  gas_price NUMERIC,
  nonce INTEGER,
  block_number BIGINT,
  transaction_type TEXT NOT NULL DEFAULT 'send',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create wallet_allowances table
CREATE TABLE public.wallet_allowances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.autonomous_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  max_amount_per_tx NUMERIC NOT NULL DEFAULT 1000,
  daily_limit NUMERIC NOT NULL DEFAULT 10000,
  daily_spent NUMERIC NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  allowed_tokens TEXT[] NOT NULL DEFAULT ARRAY['ETH', 'USDC', 'USDT'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wallet_id, agent_id)
);

-- Create wallet_tokens table for supported tokens
CREATE TABLE public.wallet_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  contract_address TEXT,
  decimals INTEGER NOT NULL DEFAULT 18,
  chain TEXT NOT NULL DEFAULT 'ethereum',
  logo_url TEXT,
  is_native BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(symbol, chain)
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallets
CREATE POLICY "Users can view own wallets"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own wallets"
  ON public.wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets"
  ON public.wallets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets"
  ON public.wallets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for wallet_transactions
CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.wallet_transactions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for wallet_allowances
CREATE POLICY "Users can manage own allowances"
  ON public.wallet_allowances FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Agents can view granted allowances"
  ON public.wallet_allowances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agent_delegations
      WHERE agent_delegations.agent_id = wallet_allowances.agent_id
        AND agent_delegations.user_id = auth.uid()
        AND agent_delegations.status = 'active'
    )
  );

-- RLS Policies for wallet_tokens
CREATE POLICY "Anyone can view active tokens"
  ON public.wallet_tokens FOR SELECT
  USING (is_active = true);

-- Trigger for updated_at on wallets
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on wallet_allowances
CREATE TRIGGER update_wallet_allowances_updated_at
  BEFORE UPDATE ON public.wallet_allowances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to reset daily spending limit
CREATE OR REPLACE FUNCTION public.reset_daily_wallet_allowances()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.wallet_allowances
  SET daily_spent = 0,
      last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE
    AND is_active = true;
END;
$$;

-- Insert default tokens
INSERT INTO public.wallet_tokens (symbol, name, contract_address, decimals, chain, is_native, logo_url) VALUES
  ('ETH', 'Ethereum', NULL, 18, 'ethereum', true, 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'),
  ('USDC', 'USD Coin', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'ethereum', false, 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'),
  ('USDT', 'Tether', '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'ethereum', false, 'https://assets.coingecko.com/coins/images/325/small/Tether.png'),
  ('DAI', 'Dai Stablecoin', '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'ethereum', false, 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png'),
  ('WBTC', 'Wrapped Bitcoin', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'ethereum', false, 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png'),
  ('MATIC', 'Polygon', NULL, 18, 'polygon', true, 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png');

-- Create index for faster lookups
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_hash ON public.wallet_transactions(hash);
CREATE INDEX idx_wallet_allowances_wallet_id ON public.wallet_allowances(wallet_id);
CREATE INDEX idx_wallet_allowances_agent_id ON public.wallet_allowances(agent_id);
CREATE INDEX idx_wallet_tokens_chain ON public.wallet_tokens(chain) WHERE is_active = true;