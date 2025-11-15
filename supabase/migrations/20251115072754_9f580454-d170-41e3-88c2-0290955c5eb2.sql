-- Personal Financial Digital Twin Tables
CREATE TABLE digital_twin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  current_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  life_stage VARCHAR(50) DEFAULT 'early-career',
  risk_tolerance VARCHAR(20) DEFAULT 'moderate',
  values_priorities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID REFERENCES digital_twin_profiles ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  scenario_type VARCHAR(50) NOT NULL,
  scenario_name VARCHAR(200),
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  monte_carlo_runs INT DEFAULT 1000,
  success_probability DECIMAL(5,2),
  projected_outcomes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID REFERENCES digital_twin_profiles ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_name VARCHAR(100),
  decisions JSONB[] DEFAULT ARRAY[]::JSONB[],
  final_state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Autonomous Agent Tables
CREATE TABLE autonomous_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name VARCHAR(100) NOT NULL,
  agent_type VARCHAR(50) NOT NULL,
  capabilities JSONB[] DEFAULT ARRAY[]::JSONB[],
  required_permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  agent_id UUID REFERENCES autonomous_agents ON DELETE CASCADE,
  granted_permissions JSONB DEFAULT '{}'::jsonb,
  constraints JSONB DEFAULT '{}'::jsonb,
  scenario_id UUID REFERENCES twin_scenarios ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_action_at TIMESTAMPTZ
);

CREATE TABLE agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delegation_id UUID REFERENCES agent_delegations ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  success BOOLEAN DEFAULT TRUE,
  user_notified BOOLEAN DEFAULT FALSE,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Behavioral Finance Guardian Tables
CREATE TABLE trading_emotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  detected_emotion VARCHAR(50) NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  triggers JSONB DEFAULT '{}'::jsonb,
  intervention_shown BOOLEAN DEFAULT FALSE,
  user_action VARCHAR(50),
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE behavioral_guardrails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cooling_off_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  triggered_by VARCHAR(50) NOT NULL,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  early_exit_requested BOOLEAN DEFAULT FALSE,
  reflection_notes TEXT
);

-- RLS Policies for Digital Twin
ALTER TABLE digital_twin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own twin profiles" ON digital_twin_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own scenarios" ON twin_scenarios
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON twin_sessions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Agents
ALTER TABLE autonomous_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view agents" ON autonomous_agents
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own delegations" ON agent_delegations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own agent actions" ON agent_actions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for Behavioral Guardian
ALTER TABLE trading_emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_guardrails ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooling_off_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own emotions" ON trading_emotions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own guardrails" ON behavioral_guardrails
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cooling off sessions" ON cooling_off_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Seed default agents
INSERT INTO autonomous_agents (agent_name, agent_type, capabilities, required_permissions, icon, description) VALUES
('Investment Manager', 'investment', ARRAY['{"name": "Portfolio Rebalancing", "description": "Automatically rebalance portfolio to target allocation"}'::jsonb, '{"name": "Tax Loss Harvesting", "description": "Harvest tax losses to offset gains"}'::jsonb, '{"name": "Dividend Reinvestment", "description": "Automatically reinvest dividends"}'::jsonb], ARRAY['view_portfolio', 'execute_trades', 'manage_allocations'], 'trending-up', 'Manages your investment portfolio 24/7, optimizing for tax efficiency and target allocation'),
('Liability Agent', 'debt', ARRAY['{"name": "Refinance Monitoring", "description": "Monitor market rates for refinancing opportunities"}'::jsonb, '{"name": "Application Processing", "description": "Submit refinance applications automatically"}'::jsonb], ARRAY['view_debts', 'submit_applications', 'access_credit_report'], 'shield', 'Proactively finds and executes refinancing opportunities to lower your cost of capital'),
('DeFi Manager', 'defi', ARRAY['{"name": "Yield Optimization", "description": "Move funds to highest-yielding protocols"}'::jsonb, '{"name": "Risk Monitoring", "description": "Monitor protocol safety and TVL"}'::jsonb, '{"name": "Reward Harvesting", "description": "Claim and compound rewards"}'::jsonb], ARRAY['manage_wallet', 'execute_transactions', 'approve_contracts'], 'coins', 'Manages on-chain positions for optimal yield while monitoring safety'),
('Bill Negotiator', 'admin', ARRAY['{"name": "Subscription Detection", "description": "Identify subscription opportunities"}'::jsonb, '{"name": "Price Negotiation", "description": "Negotiate better rates with providers"}'::jsonb], ARRAY['view_transactions', 'contact_merchants'], 'phone', 'Negotiates lower bills and cancels unused subscriptions'),
('Tax Optimizer', 'tax', ARRAY['{"name": "Quarterly Projections", "description": "Calculate estimated quarterly taxes"}'::jsonb, '{"name": "Deduction Tracking", "description": "Track all tax-deductible expenses"}'::jsonb, '{"name": "Payment Automation", "description": "Submit quarterly tax payments"}'::jsonb], ARRAY['view_income', 'view_expenses', 'submit_payments'], 'calculator', 'Optimizes your tax strategy and automates quarterly payments'),
('Financial Coach', 'coaching', ARRAY['{"name": "Goal Tracking", "description": "Monitor progress towards financial goals"}'::jsonb, '{"name": "Spending Insights", "description": "Analyze spending patterns"}'::jsonb, '{"name": "Recommendations", "description": "Provide personalized advice"}'::jsonb], ARRAY['view_all_data'], 'sparkles', 'Your AI financial advisor providing personalized guidance');

-- Create indexes for performance
CREATE INDEX idx_twin_scenarios_user ON twin_scenarios(user_id);
CREATE INDEX idx_twin_scenarios_twin ON twin_scenarios(twin_id);
CREATE INDEX idx_agent_delegations_user ON agent_delegations(user_id);
CREATE INDEX idx_agent_delegations_status ON agent_delegations(status);
CREATE INDEX idx_agent_actions_user ON agent_actions(user_id);
CREATE INDEX idx_agent_actions_delegation ON agent_actions(delegation_id);
CREATE INDEX idx_trading_emotions_user ON trading_emotions(user_id);
CREATE INDEX idx_cooling_off_sessions_user ON cooling_off_sessions(user_id);