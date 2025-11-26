-- Phase 4: Advanced Intelligence - Core Tables

-- Behavioral Learning Engine Tables
CREATE TABLE user_behavior_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  sample_size INTEGER DEFAULT 0,
  first_detected_at TIMESTAMPTZ DEFAULT now(),
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1),
  CONSTRAINT valid_sample_size CHECK (sample_size >= 0)
);

CREATE INDEX idx_behavior_patterns_user ON user_behavior_patterns(user_id);
CREATE INDEX idx_behavior_patterns_type ON user_behavior_patterns(pattern_type);

CREATE TABLE learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  prediction_id UUID,
  was_accurate BOOLEAN,
  feedback_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_learning_events_user ON learning_events(user_id);
CREATE INDEX idx_learning_events_type ON learning_events(event_type);

-- Multi-Factor Anomaly Detection Tables
CREATE TABLE financial_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  factors JSONB NOT NULL DEFAULT '[]',
  affected_entity_type TEXT,
  affected_entity_id UUID,
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolution_type TEXT,
  false_positive BOOLEAN DEFAULT false,
  CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX idx_anomalies_user ON financial_anomalies(user_id);
CREATE INDEX idx_anomalies_severity ON financial_anomalies(severity);
CREATE INDEX idx_anomalies_unresolved ON financial_anomalies(user_id, resolved_at) WHERE resolved_at IS NULL;

-- RLS Policies
ALTER TABLE user_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own behavior patterns"
  ON user_behavior_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning events"
  ON learning_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning events"
  ON learning_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own anomalies"
  ON financial_anomalies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own anomalies"
  ON financial_anomalies FOR UPDATE
  USING (auth.uid() = user_id);