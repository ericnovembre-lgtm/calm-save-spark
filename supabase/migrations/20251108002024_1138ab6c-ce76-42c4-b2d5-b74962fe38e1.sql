-- ============================================================================
-- PHASE 1: Multi-Account Aggregation, Gamification, Multi-Currency, Bill Negotiation
-- ============================================================================

-- ============================================================================
-- 1. GAMIFICATION SYSTEM
-- ============================================================================

-- Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'trophy',
  points INTEGER NOT NULL DEFAULT 0,
  requirement JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'award',
  badge_color TEXT DEFAULT 'gold',
  points INTEGER NOT NULL DEFAULT 0,
  requirement JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User achievements (many-to-many)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- User challenge progress
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress NUMERIC DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, challenge_id)
);

-- User streaks
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Enable RLS on gamification tables
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges and achievements (public read)
CREATE POLICY "Anyone can view challenges"
  ON public.challenges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

-- RLS Policies for user achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for challenge progress
CREATE POLICY "Users can view own challenge progress"
  ON public.user_challenge_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge progress"
  ON public.user_challenge_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
  ON public.user_challenge_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for streaks
CREATE POLICY "Users can view own streaks"
  ON public.user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON public.user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON public.user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. MULTI-CURRENCY SUPPORT
-- ============================================================================

-- Add currency columns to existing tables
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS original_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS original_currency TEXT;

ALTER TABLE public.goals 
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

ALTER TABLE public.pots 
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

ALTER TABLE public.debts 
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

ALTER TABLE public.connected_accounts 
  ALTER COLUMN currency SET DEFAULT 'USD';

-- Exchange rates cache table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate NUMERIC NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(base_currency, target_currency)
);

-- User currency preferences
CREATE TABLE IF NOT EXISTS public.user_currency_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_currency TEXT NOT NULL DEFAULT 'USD',
  display_all_currencies BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_currency_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exchange rates (public read)
CREATE POLICY "Anyone can view exchange rates"
  ON public.exchange_rates FOR SELECT
  USING (true);

-- RLS Policies for currency preferences
CREATE POLICY "Users can view own currency preferences"
  ON public.user_currency_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own currency preferences"
  ON public.user_currency_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own currency preferences"
  ON public.user_currency_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. BILL NEGOTIATION SERVICE
-- ============================================================================

-- Bill negotiation opportunities
CREATE TABLE IF NOT EXISTS public.bill_negotiation_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,
  category TEXT,
  current_amount NUMERIC NOT NULL,
  estimated_savings NUMERIC,
  confidence_score NUMERIC,
  status TEXT DEFAULT 'identified',
  detected_at TIMESTAMPTZ DEFAULT now(),
  last_charge_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Bill negotiation requests
CREATE TABLE IF NOT EXISTS public.bill_negotiation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.bill_negotiation_opportunities(id) ON DELETE SET NULL,
  merchant TEXT NOT NULL,
  current_amount NUMERIC NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending',
  result_amount NUMERIC,
  actual_savings NUMERIC,
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.bill_negotiation_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_negotiation_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bill negotiation opportunities
CREATE POLICY "Users can view own opportunities"
  ON public.bill_negotiation_opportunities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own opportunities"
  ON public.bill_negotiation_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own opportunities"
  ON public.bill_negotiation_opportunities FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for bill negotiation requests
CREATE POLICY "Users can view own requests"
  ON public.bill_negotiation_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own requests"
  ON public.bill_negotiation_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own requests"
  ON public.bill_negotiation_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. PLAID INTEGRATION ENHANCEMENTS
-- ============================================================================

-- Add Plaid-specific fields to connected_accounts if not exists
ALTER TABLE public.connected_accounts
  ADD COLUMN IF NOT EXISTS plaid_account_id TEXT,
  ADD COLUMN IF NOT EXISTS institution_id TEXT,
  ADD COLUMN IF NOT EXISTS institution_logo TEXT,
  ADD COLUMN IF NOT EXISTS available_balance NUMERIC,
  ADD COLUMN IF NOT EXISTS current_balance NUMERIC;

-- Plaid link tokens (temporary storage for link process)
CREATE TABLE IF NOT EXISTS public.plaid_link_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  link_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plaid_link_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own link tokens"
  ON public.plaid_link_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own link tokens"
  ON public.plaid_link_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. SEED INITIAL CHALLENGES AND ACHIEVEMENTS
-- ============================================================================

-- Insert default challenges
INSERT INTO public.challenges (challenge_type, name, description, icon, points, requirement) VALUES
  ('savings_streak', 'Savings Warrior', 'Save for 7 days in a row', 'flame', 100, '{"days": 7}'),
  ('savings_streak', 'Savings Champion', 'Save for 30 days in a row', 'trophy', 500, '{"days": 30}'),
  ('goal_completion', 'First Goal', 'Complete your first savings goal', 'target', 200, '{"goals": 1}'),
  ('goal_completion', 'Goal Master', 'Complete 5 savings goals', 'crown', 1000, '{"goals": 5}'),
  ('transaction_tracking', 'Organized', 'Track 50 transactions', 'check-circle', 150, '{"transactions": 50}'),
  ('budget_adherence', 'Budget Boss', 'Stay under budget for 30 days', 'piggy-bank', 300, '{"days": 30}')
ON CONFLICT DO NOTHING;

-- Insert default achievements
INSERT INTO public.achievements (achievement_type, name, description, icon, badge_color, points, requirement) VALUES
  ('onboarding', 'Welcome Aboard', 'Complete the onboarding process', 'rocket', 'blue', 50, '{}'),
  ('first_save', 'First Dollar Saved', 'Make your first savings transfer', 'dollar-sign', 'green', 100, '{"amount": 1}'),
  ('milestone_saver', 'Century Saver', 'Save $100 total', 'coins', 'gold', 200, '{"total": 100}'),
  ('milestone_saver', 'Grand Saver', 'Save $1,000 total', 'gem', 'gold', 500, '{"total": 1000}'),
  ('automation', 'Automation Expert', 'Set up 3 automation rules', 'settings', 'purple', 150, '{"rules": 3}'),
  ('account_connect', 'Connected', 'Link your first bank account', 'link', 'blue', 100, '{"accounts": 1}')
ON CONFLICT DO NOTHING;

-- Create trigger for updating updated_at
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_currency_preferences_updated_at
  BEFORE UPDATE ON public.user_currency_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();