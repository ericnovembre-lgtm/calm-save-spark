-- ============================================================================
-- Phase 6: Performance & Security Enhancements
-- Add indexes for optimal query performance on next-gen feature tables
-- ============================================================================

-- Agent Delegations Indexes
CREATE INDEX IF NOT EXISTS idx_agent_delegations_user_id ON agent_delegations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_delegations_status ON agent_delegations(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_agent_delegations_created_at ON agent_delegations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_delegations_agent_id ON agent_delegations(agent_id);

-- Agent Actions Indexes
CREATE INDEX IF NOT EXISTS idx_agent_actions_user_id ON agent_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_delegation_id ON agent_actions(delegation_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_executed_at ON agent_actions(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_actions_success ON agent_actions(success) WHERE success = false;

-- Behavioral Guardrails Indexes
CREATE INDEX IF NOT EXISTS idx_behavioral_guardrails_user_id ON behavioral_guardrails(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_guardrails_active ON behavioral_guardrails(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_behavioral_guardrails_rule_type ON behavioral_guardrails(rule_type);

-- Cooling Off Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_cooling_off_sessions_user_id ON cooling_off_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cooling_off_sessions_active ON cooling_off_sessions(end_time) WHERE end_time IS NULL;
CREATE INDEX IF NOT EXISTS idx_cooling_off_sessions_start_time ON cooling_off_sessions(start_time DESC);

-- Bill Negotiation Indexes
CREATE INDEX IF NOT EXISTS idx_bill_negotiation_opportunities_user_id ON bill_negotiation_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_negotiation_opportunities_status ON bill_negotiation_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_bill_negotiation_opportunities_detected_at ON bill_negotiation_opportunities(detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_bill_negotiation_requests_user_id ON bill_negotiation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_negotiation_requests_status ON bill_negotiation_requests(status);
CREATE INDEX IF NOT EXISTS idx_bill_negotiation_requests_requested_at ON bill_negotiation_requests(requested_at DESC);

-- Business Profile Indexes
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_expenses_user_id ON business_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_business_expenses_profile_id ON business_expenses(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_business_expenses_date ON business_expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_business_expenses_tax_deductible ON business_expenses(tax_deductible) WHERE tax_deductible = true;

CREATE INDEX IF NOT EXISTS idx_business_income_streams_user_id ON business_income_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_business_income_streams_profile_id ON business_income_streams(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_business_income_streams_active ON business_income_streams(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_business_registrations_user_id ON business_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_business_registrations_status ON business_registrations(registration_status);

-- Bookkeeping Integrations Indexes
CREATE INDEX IF NOT EXISTS idx_bookkeeping_integrations_user_id ON bookkeeping_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_bookkeeping_integrations_profile_id ON bookkeeping_integrations(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_bookkeeping_integrations_provider ON bookkeeping_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_bookkeeping_integrations_sync_enabled ON bookkeeping_integrations(sync_enabled) WHERE sync_enabled = true;

-- Crypto Holdings Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_holdings_user_id ON crypto_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_holdings_symbol ON crypto_holdings(symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_holdings_integration_id ON crypto_holdings(integration_id);

-- Connected Accounts Indexes  
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_sync_status ON connected_accounts(sync_status);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_last_synced ON connected_accounts(last_synced DESC);

-- Debt Management Indexes
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_debt_type ON debts(debt_type);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_id ON debt_payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_payment_date ON debt_payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_debt_payment_history_user_id ON debt_payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_payment_history_debt_id ON debt_payment_history(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_payoff_strategies_user_id ON debt_payoff_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_payoff_strategies_active ON debt_payoff_strategies(is_active) WHERE is_active = true;

-- Creditor Negotiations Indexes
CREATE INDEX IF NOT EXISTS idx_creditor_negotiations_user_id ON creditor_negotiations(user_id);
CREATE INDEX IF NOT EXISTS idx_creditor_negotiations_debt_id ON creditor_negotiations(debt_id);
CREATE INDEX IF NOT EXISTS idx_creditor_negotiations_status ON creditor_negotiations(status);

-- Automation Rules Indexes
CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_automation_rules_rule_type ON automation_rules(rule_type);

-- AI Coaching Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_ai_coaching_sessions_user_id ON ai_coaching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_sessions_last_message ON ai_coaching_sessions(last_message_at DESC);

-- AI Conversations Indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_agent_type ON ai_conversations(agent_type);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_last_message ON ai_conversations(last_message_at DESC);

-- Credit Scores Indexes
CREATE INDEX IF NOT EXISTS idx_credit_scores_user_id ON credit_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_score_date ON credit_scores(score_date DESC);

-- Carbon Footprint Indexes
CREATE INDEX IF NOT EXISTS idx_carbon_footprint_user_id ON carbon_footprint_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_footprint_log_date ON carbon_footprint_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_carbon_footprint_category ON carbon_footprint_logs(category);

-- Challenge Participants Indexes
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_completed ON challenge_participants(is_completed) WHERE is_completed = true;
CREATE INDEX IF NOT EXISTS idx_challenge_participants_rank ON challenge_participants(rank) WHERE rank IS NOT NULL;

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_agent_actions_user_success ON agent_actions(user_id, success, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_delegations_user_status ON agent_delegations(user_id, status, last_action_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_expenses_user_date ON business_expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_debts_user_type ON debts(user_id, debt_type);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_sync ON connected_accounts(user_id, sync_status, last_synced DESC);

-- ============================================================================
-- Add missing RLS policies (if any)
-- ============================================================================

-- Ensure Crypto Holdings has proper RLS (already exists but verify)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'crypto_holdings' AND policyname = 'Users can manage own crypto'
  ) THEN
    ALTER TABLE crypto_holdings ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can manage own crypto"
      ON crypto_holdings
      FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure Debt tables have proper RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'debts' AND policyname = 'Users can manage own debts'
  ) THEN
    ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can manage own debts"
      ON debts
      FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'debt_payments' AND policyname = 'Users can manage own debt payments'
  ) THEN
    ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can manage own debt payments"
      ON debt_payments
      FOR ALL
      USING (debt_id IN (SELECT id FROM debts WHERE user_id = auth.uid()));
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON INDEX idx_agent_delegations_user_id IS 'Performance index for user-scoped agent delegation queries';
COMMENT ON INDEX idx_agent_actions_user_success IS 'Composite index for filtering failed actions by user';
COMMENT ON INDEX idx_business_expenses_tax_deductible IS 'Partial index for tax-deductible expenses only';
COMMENT ON INDEX idx_cooling_off_sessions_active IS 'Partial index for active cooling-off sessions';
