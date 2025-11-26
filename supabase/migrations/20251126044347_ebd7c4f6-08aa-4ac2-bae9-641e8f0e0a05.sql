-- Digital Twin State Table
CREATE TABLE IF NOT EXISTS public.digital_twin_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  twin_version INTEGER DEFAULT 1,
  personality_profile JSONB,
  risk_tolerance NUMERIC(3,2) DEFAULT 0.5,
  savings_propensity NUMERIC(3,2) DEFAULT 0.5,
  impulse_factor NUMERIC(3,2) DEFAULT 0.5,
  financial_goals_alignment NUMERIC(3,2) DEFAULT 0.5,
  last_calibrated_at TIMESTAMPTZ DEFAULT now(),
  calibration_accuracy NUMERIC(3,2) DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.digital_twin_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own digital twin"
  ON public.digital_twin_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own digital twin"
  ON public.digital_twin_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own digital twin"
  ON public.digital_twin_state FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_digital_twin_state_user_id ON public.digital_twin_state(user_id);