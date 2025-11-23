-- Migration: Gemini-Powered Budget Features
-- Creates tables for Natural Language Budget Creation logging and Rebalancing Feedback

-- Table 1: Budget NL Creation Log
-- Purpose: Track natural language inputs for debugging and improvement
CREATE TABLE IF NOT EXISTS budget_nl_creation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  raw_input TEXT NOT NULL,
  parsed_budget JSONB,
  confidence DECIMAL(3,2),
  was_created BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_nl_creation_user ON budget_nl_creation_log(user_id);
CREATE INDEX idx_nl_creation_created ON budget_nl_creation_log(created_at);

-- Enable RLS
ALTER TABLE budget_nl_creation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own NL creation logs"
  ON budget_nl_creation_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own NL creation logs"
  ON budget_nl_creation_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Table 2: Budget Rebalancing Feedback
-- Purpose: Store user feedback on rebalancing suggestions to improve AI over time
CREATE TABLE IF NOT EXISTS budget_rebalancing_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  suggestion_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('applied', 'dismissed', 'modified')),
  feedback_reason TEXT CHECK (feedback_reason IN ('amount_too_high', 'wrong_priority', 'bad_timing', 'other')),
  feedback_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rebalancing_feedback_user ON budget_rebalancing_feedback(user_id);
CREATE INDEX idx_rebalancing_feedback_created ON budget_rebalancing_feedback(created_at);

-- Enable RLS
ALTER TABLE budget_rebalancing_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own rebalancing feedback"
  ON budget_rebalancing_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own rebalancing feedback"
  ON budget_rebalancing_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);