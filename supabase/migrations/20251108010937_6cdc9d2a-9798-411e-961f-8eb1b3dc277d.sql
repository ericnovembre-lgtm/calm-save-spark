-- Phase 6: Advanced Analytics, Social/Gamification, and Integrations

-- ============================================================================
-- ADVANCED ANALYTICS
-- ============================================================================

-- Custom Reports
CREATE TABLE IF NOT EXISTS public.custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'spending', 'income', 'savings', 'goals', 'debts', 'investments'
  filters JSONB DEFAULT '{}'::jsonb,
  date_range JSONB NOT NULL, -- {start_date, end_date}
  chart_config JSONB DEFAULT '{}'::jsonb,
  is_scheduled BOOLEAN DEFAULT false,
  schedule_frequency TEXT, -- 'daily', 'weekly', 'monthly'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Report Templates
CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_config JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Spending Forecasts
CREATE TABLE IF NOT EXISTS public.spending_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  forecast_date DATE NOT NULL,
  predicted_amount NUMERIC NOT NULL,
  confidence_score NUMERIC,
  actual_amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Benchmarks
CREATE TABLE IF NOT EXISTS public.user_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  benchmark_type TEXT NOT NULL, -- 'spending', 'savings_rate', 'debt_ratio'
  user_value NUMERIC NOT NULL,
  peer_average NUMERIC NOT NULL,
  peer_percentile INTEGER,
  demographic_group TEXT,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SOCIAL & GAMIFICATION
-- ============================================================================

-- Community Challenges
CREATE TABLE IF NOT EXISTS public.community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_name TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL, -- 'savings', 'spending_reduction', 'debt_payoff', 'streak'
  goal_config JSONB NOT NULL,
  reward_points INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Challenge Participants
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.community_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  progress NUMERIC DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  rank INTEGER,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type TEXT NOT NULL, -- 'global', 'monthly', 'challenge_specific'
  category TEXT NOT NULL, -- 'total_savings', 'streak', 'challenges_completed'
  user_id UUID NOT NULL,
  score NUMERIC NOT NULL,
  rank INTEGER NOT NULL,
  time_period TEXT,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'rewarded'
  reward_points INTEGER DEFAULT 0,
  reward_amount NUMERIC DEFAULT 0,
  referred_email TEXT,
  signed_up_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Social Shares
CREATE TABLE IF NOT EXISTS public.social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  share_type TEXT NOT NULL, -- 'achievement', 'milestone', 'challenge', 'savings_goal'
  content_id UUID,
  platform TEXT NOT NULL, -- 'twitter', 'facebook', 'linkedin', 'copy_link'
  shared_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- ADVANCED INTEGRATIONS
-- ============================================================================

-- Integration Configurations
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL, -- 'tax_software', 'payment_gateway', 'crypto_exchange', 'open_banking'
  provider_name TEXT NOT NULL, -- 'turbotax', 'stripe', 'coinbase', etc.
  credentials_encrypted TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cryptocurrency Holdings
CREATE TABLE IF NOT EXISTS public.crypto_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_id UUID REFERENCES public.integration_configs(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL, -- 'BTC', 'ETH', etc.
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  purchase_price NUMERIC,
  current_price NUMERIC,
  purchase_date TIMESTAMPTZ,
  exchange TEXT,
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tax Documents
CREATE TABLE IF NOT EXISTS public.tax_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL, -- '1099', 'W2', 'tax_summary', 'deduction_report'
  tax_year INTEGER NOT NULL,
  file_url TEXT,
  generated_at TIMESTAMPTZ,
  exported_to_software TEXT,
  exported_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payment Accounts
CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_id UUID REFERENCES public.integration_configs(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL, -- 'stripe', 'paypal', 'venmo'
  account_identifier TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  balance NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crypto Price History
CREATE TABLE IF NOT EXISTS public.crypto_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  price NUMERIC NOT NULL,
  volume_24h NUMERIC,
  market_cap NUMERIC,
  percent_change_24h NUMERIC,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Custom Reports
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reports" ON public.custom_reports FOR ALL USING (auth.uid() = user_id);

-- Report Templates
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public templates" ON public.report_templates FOR SELECT USING (is_public = true);

-- Spending Forecasts
ALTER TABLE public.spending_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own forecasts" ON public.spending_forecasts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert forecasts" ON public.spending_forecasts FOR INSERT WITH CHECK (true);

-- User Benchmarks
ALTER TABLE public.user_benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own benchmarks" ON public.user_benchmarks FOR SELECT USING (auth.uid() = user_id);

-- Community Challenges
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active challenges" ON public.community_challenges FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage challenges" ON public.community_challenges FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Challenge Participants
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can join challenges" ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own participation" ON public.challenge_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view leaderboard" ON public.challenge_participants FOR SELECT USING (true);

-- Leaderboards
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view leaderboards" ON public.leaderboards FOR SELECT USING (true);

-- Referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own referrals" ON public.referrals FOR ALL USING (auth.uid() = referrer_user_id);

-- Social Shares
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own shares" ON public.social_shares FOR ALL USING (auth.uid() = user_id);

-- Integration Configs
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own integrations" ON public.integration_configs FOR ALL USING (auth.uid() = user_id);

-- Crypto Holdings
ALTER TABLE public.crypto_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own crypto" ON public.crypto_holdings FOR ALL USING (auth.uid() = user_id);

-- Tax Documents
ALTER TABLE public.tax_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tax documents" ON public.tax_documents FOR ALL USING (auth.uid() = user_id);

-- Payment Accounts
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own payment accounts" ON public.payment_accounts FOR ALL USING (auth.uid() = user_id);

-- Crypto Price History
ALTER TABLE public.crypto_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view crypto prices" ON public.crypto_price_history FOR SELECT USING (true);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_custom_reports_user ON public.custom_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_spending_forecasts_user ON public.spending_forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_type_category ON public.leaderboards(leaderboard_type, category);
CREATE INDEX IF NOT EXISTS idx_crypto_holdings_user ON public.crypto_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_price_history_symbol ON public.crypto_price_history(symbol, recorded_at DESC);