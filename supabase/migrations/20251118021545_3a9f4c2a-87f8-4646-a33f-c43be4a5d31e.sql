-- Create card_accounts table
CREATE TABLE public.card_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('secured', 'credit')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'frozen', 'closed')),
  credit_limit_cents BIGINT NOT NULL DEFAULT 50000,
  available_cents BIGINT NOT NULL DEFAULT 50000,
  current_balance_cents BIGINT DEFAULT 0,
  apr_bps INTEGER,
  account_number TEXT UNIQUE,
  routing_number TEXT,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cards table
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES card_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('physical', 'virtual')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'cancelled', 'expired')),
  brand TEXT DEFAULT 'Visa',
  network TEXT DEFAULT 'visa',
  last4 TEXT NOT NULL,
  exp_month INTEGER NOT NULL,
  exp_year INTEGER NOT NULL,
  cvv_encrypted TEXT,
  pan_encrypted TEXT,
  cardholder_name TEXT NOT NULL,
  billing_address JSONB,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  frozen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create card_controls table
CREATE TABLE public.card_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES card_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  daily_spend_limit_cents BIGINT,
  monthly_spend_limit_cents BIGINT,
  single_transaction_limit_cents BIGINT,
  allowed_merchant_categories TEXT[],
  blocked_merchant_categories TEXT[],
  international_enabled BOOLEAN DEFAULT false,
  online_enabled BOOLEAN DEFAULT true,
  contactless_enabled BOOLEAN DEFAULT true,
  atm_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id)
);

-- Create card_collateral table
CREATE TABLE public.card_collateral (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES card_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  source_account_id UUID,
  collateral_cents BIGINT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'released', 'seized')),
  pledged_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id)
);

-- Create card_transactions table
CREATE TABLE public.card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES card_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'refund', 'fee', 'payment')),
  amount_cents BIGINT NOT NULL,
  merchant_name TEXT,
  merchant_category TEXT,
  description TEXT,
  status TEXT DEFAULT 'posted' CHECK (status IN ('pending', 'posted', 'declined', 'reversed')),
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  posted_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_card_accounts_user ON card_accounts(user_id);
CREATE INDEX idx_card_accounts_status ON card_accounts(status);
CREATE INDEX idx_cards_account ON cards(account_id);
CREATE INDEX idx_cards_user ON cards(user_id);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_card_controls_user ON card_controls(user_id);
CREATE INDEX idx_card_collateral_user ON card_collateral(user_id);
CREATE INDEX idx_card_collateral_source ON card_collateral(source_account_id);
CREATE INDEX idx_card_transactions_card ON card_transactions(card_id);
CREATE INDEX idx_card_transactions_account ON card_transactions(account_id);
CREATE INDEX idx_card_transactions_user_date ON card_transactions(user_id, transaction_date DESC);
CREATE INDEX idx_card_transactions_status ON card_transactions(status);

-- Enable RLS
ALTER TABLE card_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_collateral ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for card_accounts
CREATE POLICY "Users can view own card_accounts"
  ON card_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own card_accounts"
  ON card_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own card_accounts"
  ON card_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for cards
CREATE POLICY "Users can view own cards"
  ON cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards"
  ON cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON cards FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for card_controls
CREATE POLICY "Users can view own card_controls"
  ON card_controls FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own card_controls"
  ON card_controls FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own card_controls"
  ON card_controls FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for card_collateral
CREATE POLICY "Users can view own card_collateral"
  ON card_collateral FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own card_collateral"
  ON card_collateral FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own card_collateral"
  ON card_collateral FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for card_transactions
CREATE POLICY "Users can view own card_transactions"
  ON card_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own card_transactions"
  ON card_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);