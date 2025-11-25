-- Card Spend Rules: Save-While-You-Spend automation
CREATE TABLE IF NOT EXISTS card_spend_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('percentage', 'flat_amount', 'round_up')),
  rule_value DECIMAL(10, 2) NOT NULL,
  destination_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  destination_pot_id UUID REFERENCES pots(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  min_transaction_amount DECIMAL(10, 2) DEFAULT 0,
  max_daily_save DECIMAL(10, 2),
  category_filters TEXT[],
  merchant_filters TEXT[],
  total_saved DECIMAL(10, 2) DEFAULT 0,
  times_triggered INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Card Points Ledger: Track all points earned and redeemed
CREATE TABLE IF NOT EXISTS card_points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES card_transactions(id) ON DELETE SET NULL,
  points_amount INTEGER NOT NULL,
  points_type TEXT NOT NULL CHECK (points_type IN ('base', 'category_multiplier', 'discipline_boost', 'streak_bonus', 'milestone', 'rule_reward')),
  multiplier DECIMAL(4, 2) DEFAULT 1.0,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Card Tier Status: Track user tier progression
CREATE TABLE IF NOT EXISTS card_tier_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_tier TEXT NOT NULL DEFAULT 'basic' CHECK (current_tier IN ('basic', 'growth', 'prestige', 'elite_legacy')),
  total_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  points_to_next_tier INTEGER,
  tier_benefits JSONB DEFAULT '{}',
  consecutive_months_paid_on_time INTEGER DEFAULT 0,
  avg_utilization_rate DECIMAL(5, 2),
  months_with_rules_active INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_spend_rules_user ON card_spend_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_card_spend_rules_card ON card_spend_rules(card_id);
CREATE INDEX IF NOT EXISTS idx_card_spend_rules_active ON card_spend_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_card_points_ledger_user ON card_points_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_card_points_ledger_card ON card_points_ledger(card_id);
CREATE INDEX IF NOT EXISTS idx_card_points_ledger_created ON card_points_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_card_tier_status_user ON card_tier_status(user_id);

-- RLS Policies
ALTER TABLE card_spend_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_tier_status ENABLE ROW LEVEL SECURITY;

-- Spend Rules policies
CREATE POLICY "Users can view own spend rules"
  ON card_spend_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own spend rules"
  ON card_spend_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spend rules"
  ON card_spend_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own spend rules"
  ON card_spend_rules FOR DELETE
  USING (auth.uid() = user_id);

-- Points Ledger policies
CREATE POLICY "Users can view own points"
  ON card_points_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert points"
  ON card_points_ledger FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tier Status policies
CREATE POLICY "Users can view own tier status"
  ON card_tier_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tier status"
  ON card_tier_status FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tier status"
  ON card_tier_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_card_spend_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER card_spend_rules_updated_at
  BEFORE UPDATE ON card_spend_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_card_spend_rules_updated_at();

CREATE TRIGGER card_tier_status_updated_at
  BEFORE UPDATE ON card_tier_status
  FOR EACH ROW
  EXECUTE FUNCTION update_card_spend_rules_updated_at();