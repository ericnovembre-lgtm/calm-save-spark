
-- =============================================
-- PHASE 2: Savings Challenges, Investment Tax Lots, Couples Dashboard
-- =============================================

-- 1. SAVINGS CHALLENGES TABLE
CREATE TABLE public.savings_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_name TEXT NOT NULL,
  challenge_type TEXT DEFAULT 'custom' CHECK (challenge_type IN ('no_spend', 'save_amount', 'reduce_category', 'custom', '52_week', 'round_up')),
  target_amount DECIMAL(12,2),
  current_amount DECIMAL(12,2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  category TEXT,
  streak_count INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT 'amber',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.savings_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings challenges" ON public.savings_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own savings challenges" ON public.savings_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings challenges" ON public.savings_challenges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings challenges" ON public.savings_challenges
  FOR DELETE USING (auth.uid() = user_id);

-- 2. CHALLENGE MILESTONES TABLE
CREATE TABLE public.challenge_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.savings_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  milestone_name TEXT NOT NULL,
  target_percentage INTEGER NOT NULL CHECK (target_percentage BETWEEN 1 AND 100),
  reached_at TIMESTAMPTZ,
  bonus_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.challenge_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge milestones" ON public.challenge_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own challenge milestones" ON public.challenge_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge milestones" ON public.challenge_milestones
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. INVESTMENT TAX LOTS TABLE (holding_period computed in app, not generated column)
CREATE TABLE public.investment_tax_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  quantity DECIMAL(18,8) NOT NULL,
  purchase_price DECIMAL(12,4) NOT NULL,
  purchase_date DATE NOT NULL,
  cost_basis DECIMAL(12,2) NOT NULL,
  current_price DECIMAL(12,4),
  unrealized_gain_loss DECIMAL(12,2),
  is_sold BOOLEAN DEFAULT false,
  sold_date DATE,
  sold_price DECIMAL(12,4),
  realized_gain_loss DECIMAL(12,2),
  account_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.investment_tax_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tax lots" ON public.investment_tax_lots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tax lots" ON public.investment_tax_lots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax lots" ON public.investment_tax_lots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tax lots" ON public.investment_tax_lots
  FOR DELETE USING (auth.uid() = user_id);

-- 4. TAX LOT HARVESTING QUEUE TABLE
CREATE TABLE public.tax_lot_harvesting_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tax_lot_id UUID NOT NULL REFERENCES public.investment_tax_lots(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('harvest', 'defer', 'ignore')),
  estimated_tax_savings DECIMAL(12,2),
  replacement_symbol TEXT,
  wash_sale_clear_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tax_lot_harvesting_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own harvest queue" ON public.tax_lot_harvesting_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own harvest queue" ON public.tax_lot_harvesting_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own harvest queue" ON public.tax_lot_harvesting_queue
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own harvest queue" ON public.tax_lot_harvesting_queue
  FOR DELETE USING (auth.uid() = user_id);

-- 5. COUPLES TABLE
CREATE TABLE public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_a_id UUID NOT NULL,
  partner_b_id UUID,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  invite_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'disconnected')),
  linked_at TIMESTAMPTZ,
  visibility_settings JSONB DEFAULT '{"balances": "full", "transactions": "shared_only", "debts": "full", "goals": "full"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own couple" ON public.couples
  FOR SELECT USING (auth.uid() = partner_a_id OR auth.uid() = partner_b_id);

CREATE POLICY "Users can create couple" ON public.couples
  FOR INSERT WITH CHECK (auth.uid() = partner_a_id);

CREATE POLICY "Users can update own couple" ON public.couples
  FOR UPDATE USING (auth.uid() = partner_a_id OR auth.uid() = partner_b_id);

-- 6. COUPLE SHARED GOALS TABLE
CREATE TABLE public.couple_shared_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  partner_a_contribution DECIMAL(12,2) DEFAULT 0,
  partner_b_contribution DECIMAL(12,2) DEFAULT 0,
  target_date DATE,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT 'amber',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.couple_shared_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view shared goals" ON public.couple_shared_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id 
      AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can create shared goals" ON public.couple_shared_goals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id 
      AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
      AND c.status = 'active'
    )
  );

CREATE POLICY "Couple members can update shared goals" ON public.couple_shared_goals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id 
      AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can delete shared goals" ON public.couple_shared_goals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id 
      AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
    )
  );

-- 7. COUPLE SHARED BUDGETS TABLE
CREATE TABLE public.couple_shared_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  budget_limit DECIMAL(12,2) NOT NULL,
  current_spent DECIMAL(12,2) DEFAULT 0,
  period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.couple_shared_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view shared budgets" ON public.couple_shared_budgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id 
      AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can create shared budgets" ON public.couple_shared_budgets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id 
      AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
      AND c.status = 'active'
    )
  );

CREATE POLICY "Couple members can update shared budgets" ON public.couple_shared_budgets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id 
      AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can delete shared budgets" ON public.couple_shared_budgets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.couples c 
      WHERE c.id = couple_id 
      AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
    )
  );

-- Indexes for performance
CREATE INDEX idx_savings_challenges_user ON public.savings_challenges(user_id);
CREATE INDEX idx_savings_challenges_active ON public.savings_challenges(user_id, is_active);
CREATE INDEX idx_challenge_milestones_challenge ON public.challenge_milestones(challenge_id);
CREATE INDEX idx_investment_tax_lots_user ON public.investment_tax_lots(user_id);
CREATE INDEX idx_investment_tax_lots_symbol ON public.investment_tax_lots(user_id, symbol);
CREATE INDEX idx_tax_lot_harvesting_queue_user ON public.tax_lot_harvesting_queue(user_id);
CREATE INDEX idx_couples_partners ON public.couples(partner_a_id, partner_b_id);
CREATE INDEX idx_couples_invite ON public.couples(invite_code);
CREATE INDEX idx_couple_shared_goals_couple ON public.couple_shared_goals(couple_id);
CREATE INDEX idx_couple_shared_budgets_couple ON public.couple_shared_budgets(couple_id);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.savings_challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_shared_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_shared_budgets;
