-- Phase 3: Business-of-One OS Tables

-- Business registrations (Stripe Atlas integration)
CREATE TABLE IF NOT EXISTS public.business_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_profile_id UUID REFERENCES public.business_profiles(id),
  entity_type TEXT NOT NULL, -- 'sole_prop', 's_corp', 'llc', 'c_corp'
  registration_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  atlas_application_id TEXT,
  state TEXT NOT NULL,
  ein TEXT,
  incorporation_date DATE,
  annual_revenue_estimate DECIMAL(12,2),
  provider TEXT DEFAULT 'stripe_atlas',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Synthetic paycheck calculations for irregular income
CREATE TABLE IF NOT EXISTS public.synthetic_paychecks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_profile_id UUID REFERENCES public.business_profiles(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_income DECIMAL(12,2) NOT NULL,
  calculated_paycheck DECIMAL(12,2) NOT NULL,
  withholding_federal DECIMAL(12,2) NOT NULL,
  withholding_state DECIMAL(12,2) NOT NULL,
  withholding_fica DECIMAL(12,2) NOT NULL,
  net_paycheck DECIMAL(12,2) NOT NULL,
  income_sources JSONB DEFAULT '[]', -- Array of {source, amount, date}
  calculation_method TEXT DEFAULT 'rolling_average', -- 'rolling_average', 'seasonal', 'manual'
  status TEXT DEFAULT 'calculated', -- 'calculated', 'processed', 'paid'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quarterly tax projections
CREATE TABLE IF NOT EXISTS public.quarterly_tax_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_profile_id UUID REFERENCES public.business_profiles(id),
  tax_year INTEGER NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  projected_income DECIMAL(12,2) NOT NULL,
  projected_expenses DECIMAL(12,2) NOT NULL,
  estimated_tax_federal DECIMAL(12,2) NOT NULL,
  estimated_tax_state DECIMAL(12,2) NOT NULL,
  estimated_tax_self_employment DECIMAL(12,2) NOT NULL,
  total_estimated_tax DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  due_date DATE NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  confidence_score DECIMAL(3,2) DEFAULT 0.85,
  methodology TEXT DEFAULT 'annualized',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, business_profile_id, tax_year, quarter)
);

-- Bookkeeping integrations (QuickBooks, Xero)
CREATE TABLE IF NOT EXISTS public.bookkeeping_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_profile_id UUID REFERENCES public.business_profiles(id),
  provider TEXT NOT NULL, -- 'quickbooks', 'xero', 'wave'
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  realm_id TEXT, -- QuickBooks company ID
  tenant_id TEXT, -- Xero organization ID
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'active', -- 'active', 'error', 'disconnected'
  sync_frequency TEXT DEFAULT 'daily', -- 'realtime', 'hourly', 'daily'
  scopes TEXT[] DEFAULT ARRAY['read', 'write'],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Business income streams tracking
CREATE TABLE IF NOT EXISTS public.business_income_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_profile_id UUID REFERENCES public.business_profiles(id),
  stream_name TEXT NOT NULL,
  stream_type TEXT NOT NULL, -- 'client_project', 'subscription', 'product_sales', 'affiliate', 'royalty'
  platform TEXT, -- 'upwork', 'stripe', 'gumroad', etc
  integration_id UUID REFERENCES public.bookkeeping_integrations(id),
  is_active BOOLEAN DEFAULT true,
  average_monthly_revenue DECIMAL(12,2),
  revenue_volatility DECIMAL(5,2), -- Standard deviation
  seasonality_pattern JSONB, -- {month: multiplier}
  payment_terms TEXT, -- 'net_30', 'upfront', 'subscription'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 3: Autonomous DeFi & RWA Manager Tables

-- DeFi positions tracking
CREATE TABLE IF NOT EXISTS public.defi_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wallet_id UUID REFERENCES public.wallets(id),
  protocol TEXT NOT NULL, -- 'aave', 'compound', 'uniswap', 'curve'
  protocol_version TEXT, -- 'v2', 'v3'
  position_type TEXT NOT NULL, -- 'lending', 'borrowing', 'liquidity_pool', 'staking'
  asset_symbol TEXT NOT NULL,
  asset_address TEXT,
  chain TEXT NOT NULL DEFAULT 'ethereum',
  quantity DECIMAL(36,18) NOT NULL,
  entry_price DECIMAL(18,8),
  current_price DECIMAL(18,8),
  current_value_usd DECIMAL(12,2),
  apy DECIMAL(5,2), -- Annual percentage yield
  health_factor DECIMAL(5,2), -- For lending positions
  position_metadata JSONB DEFAULT '{}', -- Protocol-specific data
  auto_managed BOOLEAN DEFAULT false,
  last_rebalanced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Yield optimization strategies
CREATE TABLE IF NOT EXISTS public.yield_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  strategy_name TEXT NOT NULL,
  strategy_type TEXT NOT NULL, -- 'yield_farming', 'stable_lending', 'auto_compound', 'liquidity_provision'
  target_protocols TEXT[] NOT NULL,
  target_apy_min DECIMAL(5,2) NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  max_allocation_percent DECIMAL(5,2) DEFAULT 25.00,
  rebalance_threshold DECIMAL(5,2) DEFAULT 1.00, -- % difference to trigger
  auto_execute BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  constraints JSONB DEFAULT '{}', -- {max_gas_fee, min_position_size, etc}
  performance_tracking JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Real World Asset (RWA) holdings
CREATE TABLE IF NOT EXISTS public.rwa_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wallet_id UUID REFERENCES public.wallets(id),
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- 'treasury', 'real_estate', 'commodities', 'private_credit'
  token_symbol TEXT NOT NULL, -- 'OUSG', 'BUIDL', 'RWA001'
  token_address TEXT NOT NULL,
  chain TEXT NOT NULL DEFAULT 'ethereum',
  quantity DECIMAL(36,18) NOT NULL,
  purchase_price DECIMAL(18,8) NOT NULL,
  current_price DECIMAL(18,8),
  current_value_usd DECIMAL(12,2),
  yield_rate DECIMAL(5,2), -- Annual yield
  issuer TEXT NOT NULL, -- 'Ondo Finance', 'BlackRock', etc
  underlying_asset_info JSONB, -- Details about underlying asset
  maturity_date DATE,
  minimum_hold_period INTEGER, -- Days
  liquidity_rating TEXT, -- 'high', 'medium', 'low'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- DeFi transaction history
CREATE TABLE IF NOT EXISTS public.defi_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wallet_id UUID REFERENCES public.wallets(id),
  transaction_hash TEXT NOT NULL,
  transaction_type TEXT NOT NULL, -- 'deposit', 'withdraw', 'swap', 'claim_rewards', 'rebalance'
  protocol TEXT NOT NULL,
  chain TEXT NOT NULL DEFAULT 'ethereum',
  from_asset TEXT,
  from_amount DECIMAL(36,18),
  to_asset TEXT,
  to_amount DECIMAL(36,18),
  gas_fee_usd DECIMAL(12,2),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  executed_by TEXT DEFAULT 'manual', -- 'manual', 'autonomous_agent'
  strategy_id UUID REFERENCES public.yield_strategies(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.business_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synthetic_paychecks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarterly_tax_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookkeeping_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_income_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defi_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rwa_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defi_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Business-of-One OS

CREATE POLICY "Users can view own business registrations"
  ON public.business_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own business registrations"
  ON public.business_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business registrations"
  ON public.business_registrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own synthetic paychecks"
  ON public.synthetic_paychecks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own synthetic paychecks"
  ON public.synthetic_paychecks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tax projections"
  ON public.quarterly_tax_projections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tax projections"
  ON public.quarterly_tax_projections FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own bookkeeping integrations"
  ON public.bookkeeping_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookkeeping integrations"
  ON public.bookkeeping_integrations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own income streams"
  ON public.business_income_streams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own income streams"
  ON public.business_income_streams FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for DeFi & RWA Manager

CREATE POLICY "Users can view own DeFi positions"
  ON public.defi_positions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own DeFi positions"
  ON public.defi_positions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own yield strategies"
  ON public.yield_strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own yield strategies"
  ON public.yield_strategies FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own RWA holdings"
  ON public.rwa_holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own RWA holdings"
  ON public.rwa_holdings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own DeFi transactions"
  ON public.defi_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own DeFi transactions"
  ON public.defi_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Seed autonomous agents
INSERT INTO public.autonomous_agents (agent_name, agent_type, description, icon, capabilities, required_permissions, is_active)
VALUES 
  (
    'DeFi Yield Optimizer',
    'defi_manager',
    'Automatically finds and rebalances your DeFi positions for optimal yield across Aave, Compound, and other audited protocols',
    '🌾',
    ARRAY[
      '{"action": "monitor_yields", "description": "Track APY across protocols"}'::jsonb,
      '{"action": "rebalance_positions", "description": "Move funds to higher yield opportunities"}'::jsonb,
      '{"action": "claim_rewards", "description": "Auto-claim and reinvest protocol rewards"}'::jsonb,
      '{"action": "manage_risk", "description": "Monitor health factors and adjust leverage"}'::jsonb
    ],
    ARRAY['read_defi_positions', 'execute_swaps', 'manage_lending'],
    true
  ),
  (
    'Business Tax Assistant',
    'tax_optimizer',
    'Calculates synthetic paychecks from irregular income and projects quarterly taxes for freelancers and business owners',
    '📊',
    ARRAY[
      '{"action": "calculate_paycheck", "description": "Generate steady paycheck from variable income"}'::jsonb,
      '{"action": "project_taxes", "description": "Estimate quarterly tax obligations"}'::jsonb,
      '{"action": "optimize_deductions", "description": "Identify tax-saving opportunities"}'::jsonb,
      '{"action": "sync_bookkeeping", "description": "Keep financial records updated"}'::jsonb
    ],
    ARRAY['read_income', 'read_expenses', 'manage_tax_projections'],
    true
  )
ON CONFLICT DO NOTHING;