-- Add multi-currency support to budgets and transactions
ALTER TABLE user_budgets ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE budget_spending ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Add exchange rates table if not exists (for caching)
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency VARCHAR(3) NOT NULL,
  target_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(20, 10) NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(base_currency, target_currency)
);

-- Enable RLS on exchange_rates
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Public read access for exchange rates
CREATE POLICY "Exchange rates are viewable by everyone"
  ON exchange_rates FOR SELECT
  USING (true);

-- Add recurring budget configuration
CREATE TABLE IF NOT EXISTS recurring_budget_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_id UUID REFERENCES budget_templates(id),
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  next_creation_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  budget_name_template VARCHAR(255) NOT NULL,
  category_limits JSONB NOT NULL,
  total_limit DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on recurring_budget_configs
ALTER TABLE recurring_budget_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies for recurring_budget_configs
CREATE POLICY "Users can view their own recurring configs"
  ON recurring_budget_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring configs"
  ON recurring_budget_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring configs"
  ON recurring_budget_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring configs"
  ON recurring_budget_configs FOR DELETE
  USING (auth.uid() = user_id);

-- Add category suggestion cache
CREATE TABLE IF NOT EXISTS category_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  merchant_name VARCHAR(255) NOT NULL,
  amount_range VARCHAR(50),
  suggested_category_code VARCHAR(50) NOT NULL,
  confidence_score DECIMAL(3, 2),
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on category_suggestions
ALTER TABLE category_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for category_suggestions
CREATE POLICY "Users can view their own suggestions"
  ON category_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own suggestions"
  ON category_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions"
  ON category_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

-- Add spending predictions table
CREATE TABLE IF NOT EXISTS spending_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  budget_id UUID REFERENCES user_budgets(id) ON DELETE CASCADE,
  category_code VARCHAR(50),
  prediction_period VARCHAR(20) NOT NULL,
  predicted_amount DECIMAL(10, 2) NOT NULL,
  confidence_level VARCHAR(20),
  factors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL
);

-- Enable RLS on spending_predictions
ALTER TABLE spending_predictions ENABLE ROW LEVEL SECURITY;

-- RLS policies for spending_predictions
CREATE POLICY "Users can view their own predictions"
  ON spending_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert predictions"
  ON spending_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recurring_configs_user ON recurring_budget_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_configs_next_date ON recurring_budget_configs(next_creation_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_category_suggestions_user_merchant ON category_suggestions(user_id, merchant_name);
CREATE INDEX IF NOT EXISTS idx_spending_predictions_user_budget ON spending_predictions(user_id, budget_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(base_currency, target_currency);