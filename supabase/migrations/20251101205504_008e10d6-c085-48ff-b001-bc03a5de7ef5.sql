-- Phase 1: Core Financial Tracking Tables

-- Expense tracking and categorization
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  category text NOT NULL,
  merchant text,
  description text,
  transaction_date timestamptz NOT NULL,
  account_id uuid,
  is_recurring boolean DEFAULT false,
  recurring_frequency text CHECK (recurring_frequency IN ('weekly', 'monthly', 'annual')),
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Multi-account aggregation
CREATE TABLE public.connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit_card', 'investment', 'loan')),
  account_mask text,
  balance numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  plaid_access_token text,
  plaid_item_id text,
  last_synced timestamptz,
  sync_status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key for transactions.account_id
ALTER TABLE public.transactions 
  ADD CONSTRAINT transactions_account_id_fkey 
  FOREIGN KEY (account_id) REFERENCES public.connected_accounts(id) ON DELETE SET NULL;

-- Subscription detection
CREATE TABLE public.detected_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant text NOT NULL,
  amount numeric NOT NULL,
  frequency text CHECK (frequency IN ('weekly', 'monthly', 'annual')),
  last_charge_date timestamptz,
  next_expected_date timestamptz,
  is_confirmed boolean DEFAULT false,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Alerts and notifications
CREATE TABLE public.user_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text CHECK (severity IN ('info', 'warning', 'urgent')),
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for connected_accounts
CREATE POLICY "Users can view own accounts"
  ON public.connected_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON public.connected_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON public.connected_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON public.connected_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for detected_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.detected_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON public.detected_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.detected_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.detected_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_alerts
CREATE POLICY "Users can view own alerts"
  ON public.user_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.user_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON public.user_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX idx_transactions_category ON public.transactions(category);
CREATE INDEX idx_connected_accounts_user_id ON public.connected_accounts(user_id);
CREATE INDEX idx_detected_subscriptions_user_id ON public.detected_subscriptions(user_id);
CREATE INDEX idx_user_alerts_user_id ON public.user_alerts(user_id);
CREATE INDEX idx_user_alerts_unread ON public.user_alerts(user_id, is_read) WHERE is_read = false;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_connected_accounts_updated_at
  BEFORE UPDATE ON public.connected_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_detected_subscriptions_updated_at
  BEFORE UPDATE ON public.detected_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();