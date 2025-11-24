-- Wallet Push Subscriptions (new)
CREATE TABLE IF NOT EXISTS wallet_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  subscription_data JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_push_user ON wallet_push_subscriptions(user_id);

-- Wallet Notifications (new)
CREATE TABLE IF NOT EXISTS wallet_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_notifications_user ON wallet_notifications(user_id, read, created_at DESC);

-- Multi-Chain Support
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS chain TEXT DEFAULT 'ethereum';
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS chain TEXT DEFAULT 'ethereum';

CREATE TABLE IF NOT EXISTS wallet_chain_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id TEXT UNIQUE NOT NULL,
  chain_name TEXT NOT NULL,
  rpc_url TEXT NOT NULL,
  explorer_url TEXT NOT NULL,
  native_currency JSONB NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default chains (with conflict handling)
INSERT INTO wallet_chain_configs (chain_id, chain_name, rpc_url, explorer_url, native_currency, icon) VALUES
('ethereum', 'Ethereum', 'https://eth-mainnet.g.alchemy.com/v2/', 'https://etherscan.io', '{"symbol": "ETH", "name": "Ethereum", "decimals": 18}', '⟠'),
('polygon', 'Polygon', 'https://polygon-rpc.com', 'https://polygonscan.com', '{"symbol": "MATIC", "name": "Polygon", "decimals": 18}', '⬡'),
('arbitrum', 'Arbitrum', 'https://arb1.arbitrum.io/rpc', 'https://arbiscan.io', '{"symbol": "ETH", "name": "Arbitrum", "decimals": 18}', '◆')
ON CONFLICT (chain_id) DO NOTHING;

-- RLS Policies for wallet_push_subscriptions
ALTER TABLE wallet_push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own push subscriptions"
    ON wallet_push_subscriptions FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own push subscriptions"
    ON wallet_push_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own push subscriptions"
    ON wallet_push_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own push subscriptions"
    ON wallet_push_subscriptions FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS Policies for wallet_notifications
ALTER TABLE wallet_notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own notifications"
    ON wallet_notifications FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own notifications"
    ON wallet_notifications FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS Policies for wallet_chain_configs (public read)
ALTER TABLE wallet_chain_configs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view chain configs"
    ON wallet_chain_configs FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enable realtime for wallet notifications
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE wallet_notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;