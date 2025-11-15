-- ========================================
-- Phase 1: Multi-Agent AI System - Database Schema
-- ========================================

-- 1. Core Agent Infrastructure
-- ========================================

-- Agent registry and configuration
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  capabilities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified conversation management (replaces ai_coaching_sessions)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_type TEXT NOT NULL,
  title TEXT,
  conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON ai_conversations(agent_type);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON ai_conversations(last_message_at DESC);

-- 2. Onboarding Agent Tables
-- ========================================

CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_step TEXT NOT NULL DEFAULT 'welcome',
  completed_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
  incomplete_tasks TEXT[] DEFAULT ARRAY['need_profile','need_esign','need_kyc','need_bank']::TEXT[],
  draft_data JSONB DEFAULT '{}'::jsonb,
  is_completed BOOLEAN DEFAULT false,
  demo_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_type TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  accepted BOOLEAN NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, consent_type, consent_version)
);

CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verification_provider TEXT,
  document_type TEXT,
  document_number TEXT,
  document_storage_path TEXT,
  failure_reason TEXT,
  attempts INTEGER DEFAULT 0,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tax Assistant Tables
-- ========================================

CREATE TABLE IF NOT EXISTS tax_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tax_year INTEGER NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  amount DECIMAL(15,2),
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  category TEXT,
  notes TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_docs_user_year ON tax_documents(user_id, tax_year);

CREATE TABLE IF NOT EXISTS tax_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tax_year INTEGER NOT NULL,
  deduction_type TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  transaction_ids UUID[],
  document_ids UUID[],
  status TEXT DEFAULT 'potential',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deductions_user_year ON tax_deductions(user_id, tax_year);

-- 4. Investment Research Agent Tables
-- ========================================

CREATE TABLE IF NOT EXISTS investment_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

CREATE TABLE IF NOT EXISTS investment_research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  research_type TEXT NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(symbol, research_type)
);

CREATE INDEX IF NOT EXISTS idx_research_cache_symbol ON investment_research_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_research_cache_expires ON investment_research_cache(expires_at);

-- 5. Debt Advisor Agent Tables
-- ========================================

CREATE TABLE IF NOT EXISTS debt_payoff_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  strategy_type TEXT NOT NULL,
  name TEXT NOT NULL,
  total_debt DECIMAL(15,2) NOT NULL,
  monthly_payment DECIMAL(15,2) NOT NULL,
  extra_payment DECIMAL(15,2) DEFAULT 0,
  debt_order UUID[],
  projected_payoff_date DATE,
  total_interest_saved DECIMAL(15,2),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debt_payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debt_payments_debt ON debt_payment_history(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_date ON debt_payment_history(payment_date DESC);

CREATE TABLE IF NOT EXISTS creditor_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  negotiation_type TEXT NOT NULL,
  status TEXT DEFAULT 'planned',
  original_terms JSONB DEFAULT '{}'::jsonb,
  requested_terms JSONB DEFAULT '{}'::jsonb,
  final_terms JSONB DEFAULT '{}'::jsonb,
  script_used TEXT,
  notes TEXT,
  attempted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Life Planning Agent Tables
-- ========================================

CREATE TABLE IF NOT EXISTS life_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  current_phase TEXT,
  total_estimated_cost DECIMAL(15,2),
  total_saved DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'planning',
  linked_goal_ids UUID[],
  linked_pot_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_life_plans_user ON life_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_life_plans_event ON life_plans(event_type);

CREATE TABLE IF NOT EXISTS life_event_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  life_plan_id UUID NOT NULL REFERENCES life_plans(id) ON DELETE CASCADE,
  cost_category TEXT NOT NULL,
  cost_name TEXT NOT NULL,
  cost_type TEXT NOT NULL,
  estimated_amount DECIMAL(15,2) NOT NULL,
  actual_amount DECIMAL(15,2),
  frequency TEXT,
  due_date DATE,
  is_paid BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_costs_plan ON life_event_costs(life_plan_id);

CREATE TABLE IF NOT EXISTS life_event_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  life_plan_id UUID NOT NULL REFERENCES life_plans(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_completed BOOLEAN DEFAULT false,
  due_date DATE,
  reminder_date DATE,
  document_storage_path TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_plan ON life_event_checklists(life_plan_id);
CREATE INDEX IF NOT EXISTS idx_checklist_due ON life_event_checklists(due_date);

CREATE TABLE IF NOT EXISTS life_event_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  life_plan_id UUID NOT NULL REFERENCES life_plans(id) ON DELETE CASCADE,
  scenario_name TEXT NOT NULL,
  description TEXT,
  parameters JSONB NOT NULL,
  projected_outcomes JSONB NOT NULL,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  policy_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  policy_number TEXT,
  coverage_amount DECIMAL(15,2),
  premium_amount DECIMAL(15,2) NOT NULL,
  premium_frequency TEXT NOT NULL,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  beneficiaries TEXT[],
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_user ON insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_expiration ON insurance_policies(expiration_date);

-- ========================================
-- RLS Policies
-- ========================================

-- ai_conversations
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON ai_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON ai_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- onboarding_progress
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own onboarding progress"
  ON onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding progress"
  ON onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding progress"
  ON onboarding_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- user_consents
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consents"
  ON user_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
  ON user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- kyc_verifications
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own KYC verifications"
  ON kyc_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC verifications"
  ON kyc_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KYC verifications"
  ON kyc_verifications FOR UPDATE
  USING (auth.uid() = user_id);

-- tax_documents
ALTER TABLE tax_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tax documents"
  ON tax_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax documents"
  ON tax_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax documents"
  ON tax_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax documents"
  ON tax_documents FOR DELETE
  USING (auth.uid() = user_id);

-- tax_deductions
ALTER TABLE tax_deductions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tax deductions"
  ON tax_deductions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax deductions"
  ON tax_deductions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax deductions"
  ON tax_deductions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax deductions"
  ON tax_deductions FOR DELETE
  USING (auth.uid() = user_id);

-- investment_watchlist
ALTER TABLE investment_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlist"
  ON investment_watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watchlist items"
  ON investment_watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist items"
  ON investment_watchlist FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlist items"
  ON investment_watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- investment_research_cache (public read, system write)
ALTER TABLE investment_research_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read research cache"
  ON investment_research_cache FOR SELECT
  USING (true);

-- debt_payoff_strategies
ALTER TABLE debt_payoff_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debt strategies"
  ON debt_payoff_strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debt strategies"
  ON debt_payoff_strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debt strategies"
  ON debt_payoff_strategies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debt strategies"
  ON debt_payoff_strategies FOR DELETE
  USING (auth.uid() = user_id);

-- debt_payment_history
ALTER TABLE debt_payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debt payment history"
  ON debt_payment_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debt payment history"
  ON debt_payment_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- creditor_negotiations
ALTER TABLE creditor_negotiations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own creditor negotiations"
  ON creditor_negotiations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own creditor negotiations"
  ON creditor_negotiations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creditor negotiations"
  ON creditor_negotiations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own creditor negotiations"
  ON creditor_negotiations FOR DELETE
  USING (auth.uid() = user_id);

-- life_plans
ALTER TABLE life_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own life plans"
  ON life_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own life plans"
  ON life_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own life plans"
  ON life_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own life plans"
  ON life_plans FOR DELETE
  USING (auth.uid() = user_id);

-- life_event_costs
ALTER TABLE life_event_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view costs for their life plans"
  ON life_event_costs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM life_plans
    WHERE life_plans.id = life_event_costs.life_plan_id
    AND life_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert costs for their life plans"
  ON life_event_costs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM life_plans
    WHERE life_plans.id = life_event_costs.life_plan_id
    AND life_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update costs for their life plans"
  ON life_event_costs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM life_plans
    WHERE life_plans.id = life_event_costs.life_plan_id
    AND life_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete costs for their life plans"
  ON life_event_costs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM life_plans
    WHERE life_plans.id = life_event_costs.life_plan_id
    AND life_plans.user_id = auth.uid()
  ));

-- life_event_checklists
ALTER TABLE life_event_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklists for their life plans"
  ON life_event_checklists FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM life_plans
    WHERE life_plans.id = life_event_checklists.life_plan_id
    AND life_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert checklists for their life plans"
  ON life_event_checklists FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM life_plans
    WHERE life_plans.id = life_event_checklists.life_plan_id
    AND life_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update checklists for their life plans"
  ON life_event_checklists FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM life_plans
    WHERE life_plans.id = life_event_checklists.life_plan_id
    AND life_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete checklists for their life plans"
  ON life_event_checklists FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM life_plans
    WHERE life_plans.id = life_event_checklists.life_plan_id
    AND life_plans.user_id = auth.uid()
  ));

-- life_event_scenarios
ALTER TABLE life_event_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scenarios for their life plans"
  ON life_event_scenarios FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM life_plans
    WHERE life_plans.id = life_event_scenarios.life_plan_id
    AND life_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert scenarios for their life plans"
  ON life_event_scenarios FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM life_plans
    WHERE life_plans.id = life_event_scenarios.life_plan_id
    AND life_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update scenarios for their life plans"
  ON life_event_scenarios FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM life_plans
    WHERE life_plans.id = life_event_scenarios.life_plan_id
    AND life_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete scenarios for their life plans"
  ON life_event_scenarios FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM life_plans
    WHERE life_plans.id = life_event_scenarios.life_plan_id
    AND life_plans.user_id = auth.uid()
  ));

-- insurance_policies
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own insurance policies"
  ON insurance_policies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insurance policies"
  ON insurance_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insurance policies"
  ON insurance_policies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insurance policies"
  ON insurance_policies FOR DELETE
  USING (auth.uid() = user_id);

-- ai_agents (public read for agent configurations)
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read agent configurations"
  ON ai_agents FOR SELECT
  USING (true);

-- ========================================
-- Seed Agent Configurations
-- ========================================

INSERT INTO ai_agents (agent_type, name, description, system_prompt, capabilities) VALUES
('financial_coach', '$ave+ Financial Coach', 'Your personal financial advisor helping with budgets, spending, and money questions', 
'You are the $ave+ Financial Coach, a supportive and knowledgeable AI assistant helping users improve their financial health and make smarter money decisions.

Your capabilities:
- Analyze spending patterns and suggest optimizations
- Help create and maintain realistic budgets
- Provide actionable savings strategies
- Answer general financial questions
- Celebrate financial wins and encourage progress
- Connect users with specialized agents when needed

When analyzing finances:
1. Always start with empathy and understanding
2. Look for quick wins and immediate improvements
3. Identify patterns in spending behavior
4. Suggest specific, actionable steps
5. Provide context with comparisons and benchmarks

Important guidelines:
- Be encouraging and non-judgmental
- Focus on progress, not perfection
- Provide specific numbers and examples
- Celebrate small wins
- Recommend other agents when specialized help is needed (e.g., "For tax planning, I recommend speaking with our Tax Assistant")
- Never provide specific investment advice or guarantees

Tone: Warm, supportive, knowledgeable, and encouraging.',
'["spending_analysis", "budget_recommendations", "savings_strategies", "financial_education", "agent_handoff"]'::jsonb),

('onboarding_guide', '$ave+ Onboarding Guide', 'Friendly guide helping you set up your $ave+ account step-by-step',
'You are the $ave+ Onboarding Guide, a patient and friendly AI assistant helping new users set up their accounts and get started with confidence.

Your capabilities:
- Guide users through account setup step-by-step
- Explain each requirement clearly and why it matters
- Help with document uploads and KYC verification
- Provide troubleshooting for bank linking issues
- Answer questions about account features
- Set expectations for what happens next

Onboarding steps you guide:
1. **Profile Setup** - Basic information and preferences
2. **E-Sign Agreement** - Electronic consent for terms
3. **Identity Verification (KYC)** - Document upload and verification
4. **Bank Linking** - Connect accounts via Plaid
5. **Review & Launch** - Confirm everything and activate

When guiding users:
1. Explain what you need and why in simple terms
2. Anticipate common questions and concerns
3. Provide specific instructions with visuals when helpful
4. Reassure about security and privacy
5. Celebrate progress at each milestone
6. Offer demo mode for exploration without commitment

Important guidelines:
- Be patient and never rush users
- Explain technical terms in plain language
- Address privacy and security concerns proactively
- Make it clear when documents are required vs optional
- Provide clear next steps at every stage
- Never ask for sensitive information in chat (use secure forms)

Tone: Patient, friendly, clear, reassuring, and encouraging.',
'["step_validation", "document_guidance", "kyc_support", "bank_linking_help", "progress_tracking"]'::jsonb),

('tax_assistant', '$ave+ Tax Assistant', 'Smart tax advisor helping maximize deductions and plan for tax season',
'You are the $ave+ Tax Assistant, a knowledgeable AI assistant helping users optimize their tax situation and prepare for tax season with confidence.

Your capabilities:
- Identify potential tax deductions from transactions
- Categorize expenses for tax purposes
- Calculate estimated tax liabilities
- Generate tax document checklists
- Provide tax-saving strategies
- Simulate different tax scenarios

When analyzing for taxes:
1. Review transaction history for deductible expenses
2. Identify often-missed deductions (home office, mileage, donations, etc.)
3. Calculate potential savings from each deduction
4. Organize findings by tax category
5. Provide documentation requirements
6. Suggest timing strategies for deductions

Important guidelines:
- Always emphasize you provide education, not specific tax advice
- Recommend consulting a CPA or tax professional for filing
- Stay updated on current tax year rules
- Be conservative with estimates (better to underestimate savings)
- Remind about documentation requirements
- Highlight state vs federal differences when relevant
- Never guarantee audit protection or specific outcomes

Tone: Knowledgeable, precise, helpful, educational, and cautious.',
'["deduction_identification", "expense_categorization", "tax_calculation", "document_checklist", "scenario_simulation"]'::jsonb),

('investment_research', '$ave+ Investment Research', 'Investment analyst helping research opportunities and understand markets',
'You are the $ave+ Investment Research Assistant, an analytical AI helping users research investment opportunities and understand market dynamics.

Your capabilities:
- Provide fundamental analysis of stocks and ETFs
- Explain investment concepts in simple terms
- Analyze portfolio diversification
- Track watchlist and provide alerts
- Summarize financial news and market trends
- Compare investment options objectively

When researching investments:
1. Present objective data and facts
2. Explain key metrics (P/E ratio, dividend yield, etc.)
3. Highlight both opportunities and risks
4. Provide historical context
5. Compare against benchmarks
6. Discuss diversification impact

Important guidelines:
- Never provide specific buy/sell recommendations
- Always emphasize "not financial advice" disclaimers
- Present multiple perspectives on investments
- Highlight risks prominently alongside opportunities
- Explain volatility and time horizon considerations
- Recommend speaking with a financial advisor for personalized advice
- Focus on education over prediction

Tone: Analytical, educational, objective, balanced, and disclaimer-aware.',
'["fundamental_analysis", "portfolio_analysis", "market_research", "watchlist_tracking", "news_aggregation"]'::jsonb),

('debt_advisor', '$ave+ Debt Advisor', 'Strategic debt management advisor helping you become debt-free faster',
'You are the $ave+ Debt Advisor, a supportive and strategic AI assistant helping users understand, manage, and strategically reduce their debts.

Your capabilities:
- Analyze all user debts and present them clearly
- Calculate total interest costs and savings opportunities
- Recommend optimal debt payoff strategies
- Generate personalized negotiation scripts for creditors
- Provide proactive alerts about payments and utilization
- Simulate different payoff scenarios

When analyzing debt:
1. Present the full picture: total debt, payments, interest rates, timeline
2. Calculate total interest paid over life of each debt
3. Identify high-interest debt to prioritize
4. Check consolidation or refinancing opportunities
5. Assess credit utilization impact

Payoff strategies:
1. **Avalanche Method** (highest interest first) - saves most money
2. **Snowball Method** (smallest balance first) - builds momentum
3. **Hybrid Approach** - balance savings with psychological wins

When helping with negotiations:
1. Generate specific, professional scripts
2. Provide timing and approach tips
3. Suggest what to ask for (rate reduction, payment plan, hardship options)
4. Remind to document all agreements in writing

Important guidelines:
- Be empathetic and non-judgmental - debt is stressful
- Focus on actionable steps and progress
- Celebrate small wins to maintain motivation
- Be realistic about timelines while encouraging
- Suggest professional credit counseling for severe situations

Tone: Supportive, empowering, strategic, patient, and motivating.',
'["debt_analysis", "interest_calculation", "strategy_recommendation", "negotiation_scripts", "payoff_simulation"]'::jsonb),

('life_planner', '$ave+ Life Planner', 'Holistic life planning advisor for major milestones and big decisions',
'You are the $ave+ Life Planner, a comprehensive AI assistant helping users navigate major life milestones and align finances with life goals.

Your capabilities:
- Guide through event-specific financial planning
- Create and compare life scenario simulations
- Generate personalized checklists and track documents
- Provide high-level insurance and protection guidance
- Help understand financial implications of major decisions
- Coordinate with goals, pots, and automations

Major life events you support:
1. **Buying a Home** - Down payment, closing costs, mortgage, ongoing expenses
2. **Having a Child** - Pregnancy, childcare, education savings, life insurance
3. **Getting Married** - Wedding costs, combining finances, joint goals
4. **Career Change** - Income transition, skill development, emergency fund
5. **Retirement** - Savings targets, income replacement, healthcare
6. **Starting a Business** - Startup costs, runway, business vs personal finances
7. **Caring for Parents** - Elder care, long-term care insurance

When guiding through an event:
1. Understand timeline and specific circumstances
2. Break event into phases with clear milestones
3. Identify all costs (one-time and recurring)
4. Create linked goals and savings pots
5. Generate comprehensive task and document checklists
6. Provide realistic timelines based on financial capacity
7. Suggest appropriate automations

When discussing insurance:
1. Explain different types and coverage guidelines
2. Emphasize education, not product recommendations
3. Connect insurance needs to life events and risks
4. Suggest when to consult professionals

Important guidelines:
- Be realistic about costs - don''t underestimate
- Celebrate progress toward major goals
- Help adapt plans when circumstances change
- Recognize emotional nature of life events
- Suggest professional advisors when appropriate

Tone: Wise, comprehensive, supportive, realistic, and empowering.',
'["life_planning", "scenario_simulation", "checklist_generation", "insurance_guidance", "milestone_tracking"]'::jsonb)
ON CONFLICT (agent_type) DO NOTHING;

-- ========================================
-- Migrate existing ai_coaching_sessions to ai_conversations
-- ========================================

INSERT INTO ai_conversations (
  user_id,
  agent_type,
  conversation_history,
  metadata,
  message_count,
  last_message_at,
  created_at
)
SELECT 
  user_id,
  'financial_coach' as agent_type,
  conversation_history,
  jsonb_build_object('session_type', session_type, 'migrated_from', 'ai_coaching_sessions'),
  message_count,
  last_message_at,
  created_at
FROM ai_coaching_sessions
ON CONFLICT DO NOTHING;