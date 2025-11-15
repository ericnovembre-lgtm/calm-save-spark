-- Phase 1: LifeSim Game Tables
CREATE TABLE IF NOT EXISTS public.lifesim_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_name TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  description TEXT,
  initial_conditions JSONB NOT NULL DEFAULT '{}',
  events JSONB NOT NULL DEFAULT '[]',
  learning_objectives TEXT[] DEFAULT '{}',
  estimated_duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lifesim_game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES public.lifesim_scenarios(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  current_age INTEGER DEFAULT 22,
  current_year INTEGER DEFAULT 1,
  financial_state JSONB NOT NULL DEFAULT '{"cash": 10000, "debt": 0, "investments": 0, "income": 0}',
  life_events JSONB DEFAULT '[]',
  score INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  behavioral_insights JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lifesim_player_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.lifesim_game_sessions(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL,
  decision_data JSONB NOT NULL DEFAULT '{}',
  game_year INTEGER NOT NULL,
  financial_impact JSONB DEFAULT '{}',
  risk_score NUMERIC(3,2) CHECK (risk_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 1: Investment Manager Tables
CREATE TABLE IF NOT EXISTS public.investment_mandates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_tolerance TEXT NOT NULL CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  target_allocation JSONB NOT NULL DEFAULT '{"stocks": 60, "bonds": 30, "cash": 10}',
  rebalancing_threshold NUMERIC(5,2) DEFAULT 5.00 CHECK (rebalancing_threshold > 0),
  auto_rebalance_enabled BOOLEAN DEFAULT false,
  tax_loss_harvest_enabled BOOLEAN DEFAULT false,
  min_harvest_amount NUMERIC(10,2) DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.rebalancing_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mandate_id UUID REFERENCES public.investment_mandates(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('buy', 'sell')),
  symbol TEXT NOT NULL,
  quantity NUMERIC(18,8) NOT NULL,
  price NUMERIC(18,2) NOT NULL,
  total_value NUMERIC(18,2) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'cancelled')),
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 2: Life Events Tables
CREATE TABLE IF NOT EXISTS public.life_event_playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('marriage', 'home_purchase', 'new_child', 'career_change', 'retirement')),
  event_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.playbook_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID NOT NULL REFERENCES public.life_event_playbooks(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_category TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  assigned_agent TEXT,
  automation_status TEXT CHECK (automation_status IN ('manual', 'automated', 'in_progress')),
  task_order INTEGER DEFAULT 0,
  dependencies TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.playbook_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID NOT NULL REFERENCES public.life_event_playbooks(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  provider TEXT,
  generation_status TEXT DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed')),
  download_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 2: Refinancing Tables
CREATE TABLE IF NOT EXISTS public.refinancing_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liability_type TEXT NOT NULL CHECK (liability_type IN ('mortgage', 'auto_loan', 'student_loan', 'personal_loan')),
  current_rate NUMERIC(5,2) NOT NULL,
  current_balance NUMERIC(12,2) NOT NULL,
  current_payment NUMERIC(10,2) NOT NULL,
  potential_new_rate NUMERIC(5,2) NOT NULL,
  estimated_savings_monthly NUMERIC(10,2),
  estimated_savings_total NUMERIC(12,2),
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  status TEXT DEFAULT 'detected' CHECK (status IN ('detected', 'reviewed', 'dismissed', 'initiated')),
  detected_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.refinancing_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.refinancing_opportunities(id) ON DELETE SET NULL,
  application_status TEXT DEFAULT 'initiated' CHECK (application_status IN ('initiated', 'in_progress', 'approved', 'declined', 'completed')),
  lender_name TEXT,
  new_rate NUMERIC(5,2),
  new_term_months INTEGER,
  estimated_closing_date DATE,
  actual_savings NUMERIC(12,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.lifesim_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifesim_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifesim_player_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rebalancing_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_event_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refinancing_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refinancing_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lifesim_scenarios (public read)
CREATE POLICY "Anyone can view scenarios"
  ON public.lifesim_scenarios FOR SELECT
  USING (true);

-- RLS Policies for lifesim_game_sessions
CREATE POLICY "Users can view own game sessions"
  ON public.lifesim_game_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own game sessions"
  ON public.lifesim_game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game sessions"
  ON public.lifesim_game_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for lifesim_player_decisions
CREATE POLICY "Users can view own decisions"
  ON public.lifesim_player_decisions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.lifesim_game_sessions
    WHERE id = lifesim_player_decisions.session_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create own decisions"
  ON public.lifesim_player_decisions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.lifesim_game_sessions
    WHERE id = lifesim_player_decisions.session_id
    AND user_id = auth.uid()
  ));

-- RLS Policies for investment_mandates
CREATE POLICY "Users can view own mandates"
  ON public.investment_mandates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own mandates"
  ON public.investment_mandates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mandates"
  ON public.investment_mandates FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for rebalancing_actions
CREATE POLICY "Users can view own rebalancing actions"
  ON public.rebalancing_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own rebalancing actions"
  ON public.rebalancing_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for life_event_playbooks
CREATE POLICY "Users can view own playbooks"
  ON public.life_event_playbooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own playbooks"
  ON public.life_event_playbooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playbooks"
  ON public.life_event_playbooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playbooks"
  ON public.life_event_playbooks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for playbook_tasks
CREATE POLICY "Users can view own playbook tasks"
  ON public.playbook_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.life_event_playbooks
    WHERE id = playbook_tasks.playbook_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update own playbook tasks"
  ON public.playbook_tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.life_event_playbooks
    WHERE id = playbook_tasks.playbook_id
    AND user_id = auth.uid()
  ));

-- RLS Policies for playbook_documents
CREATE POLICY "Users can view own playbook documents"
  ON public.playbook_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.life_event_playbooks
    WHERE id = playbook_documents.playbook_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create own playbook documents"
  ON public.playbook_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.life_event_playbooks
    WHERE id = playbook_documents.playbook_id
    AND user_id = auth.uid()
  ));

-- RLS Policies for refinancing_opportunities
CREATE POLICY "Users can view own refinancing opportunities"
  ON public.refinancing_opportunities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own refinancing opportunities"
  ON public.refinancing_opportunities FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for refinancing_applications
CREATE POLICY "Users can view own refinancing applications"
  ON public.refinancing_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own refinancing applications"
  ON public.refinancing_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own refinancing applications"
  ON public.refinancing_applications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_lifesim_sessions_user_status ON public.lifesim_game_sessions(user_id, status);
CREATE INDEX idx_investment_mandates_user ON public.investment_mandates(user_id);
CREATE INDEX idx_rebalancing_actions_created ON public.rebalancing_actions(created_at DESC);
CREATE INDEX idx_life_event_playbooks_user_status ON public.life_event_playbooks(user_id, status);
CREATE INDEX idx_refinancing_opportunities_user_status ON public.refinancing_opportunities(user_id, status);

-- Insert sample LifeSim scenarios
INSERT INTO public.lifesim_scenarios (scenario_name, difficulty, description, initial_conditions, events, learning_objectives, estimated_duration_minutes)
VALUES 
  ('First Job Graduate', 'easy', 'Fresh college graduate starting their first job', 
   '{"age": 22, "cash": 5000, "debt": 30000, "income": 50000}',
   '[{"year": 1, "event": "401k enrollment decision"}, {"year": 2, "event": "emergency fund opportunity"}]',
   ARRAY['emergency_fund', 'retirement_basics', 'debt_management'],
   20),
  ('Mid-Career Professional', 'medium', 'Established professional navigating major financial decisions',
   '{"age": 35, "cash": 15000, "debt": 200000, "income": 85000}',
   '[{"year": 1, "event": "home purchase decision"}, {"year": 3, "event": "child education planning"}]',
   ARRAY['homeownership', 'education_planning', 'investment_allocation'],
   30);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lifesim_game_sessions_updated_at
  BEFORE UPDATE ON public.lifesim_game_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_mandates_updated_at
  BEFORE UPDATE ON public.investment_mandates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_life_event_playbooks_updated_at
  BEFORE UPDATE ON public.life_event_playbooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playbook_tasks_updated_at
  BEFORE UPDATE ON public.playbook_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refinancing_applications_updated_at
  BEFORE UPDATE ON public.refinancing_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();