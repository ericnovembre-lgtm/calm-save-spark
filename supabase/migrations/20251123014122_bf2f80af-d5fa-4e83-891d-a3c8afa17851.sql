-- Phase 1: A/B Testing Database Schema for Negotiation Scripts

-- Create table for storing the 3 script variants
CREATE TABLE IF NOT EXISTS negotiation_script_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  opportunity_id UUID REFERENCES bill_negotiation_opportunities(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  
  -- The 3 generated scripts
  aggressive_script TEXT NOT NULL,
  friendly_script TEXT NOT NULL,
  data_driven_script TEXT NOT NULL,
  
  -- User selection
  selected_variant TEXT CHECK (selected_variant IN ('aggressive', 'friendly', 'data_driven')),
  selected_at TIMESTAMPTZ,
  
  -- Context used for generation
  leverage_points JSONB DEFAULT '[]'::jsonb,
  bloat_items JSONB DEFAULT '[]'::jsonb,
  competitor_offer JSONB,
  negotiation_score INTEGER,
  
  -- Metadata
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for tracking negotiation outcomes
CREATE TABLE IF NOT EXISTS negotiation_script_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_variant_id UUID REFERENCES negotiation_script_variants(id) ON DELETE CASCADE,
  request_id UUID REFERENCES bill_negotiation_requests(id),
  
  -- Outcome tracking
  was_successful BOOLEAN,
  actual_savings NUMERIC,
  new_monthly_amount NUMERIC,
  negotiation_notes TEXT,
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  
  -- Timing
  negotiation_completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_script_variants_user ON negotiation_script_variants(user_id);
CREATE INDEX IF NOT EXISTS idx_script_variants_opportunity ON negotiation_script_variants(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_script_variants_selected ON negotiation_script_variants(selected_variant);
CREATE INDEX IF NOT EXISTS idx_script_variants_created ON negotiation_script_variants(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_outcomes_variant ON negotiation_script_outcomes(script_variant_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_success ON negotiation_script_outcomes(was_successful);
CREATE INDEX IF NOT EXISTS idx_outcomes_request ON negotiation_script_outcomes(request_id);

-- Enable RLS
ALTER TABLE negotiation_script_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_script_outcomes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for negotiation_script_variants
CREATE POLICY "Users can view own script variants"
  ON negotiation_script_variants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own script variants"
  ON negotiation_script_variants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own script variants"
  ON negotiation_script_variants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own script variants"
  ON negotiation_script_variants FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for negotiation_script_outcomes
CREATE POLICY "Users can view own outcomes"
  ON negotiation_script_outcomes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM negotiation_script_variants
      WHERE id = script_variant_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own outcomes"
  ON negotiation_script_outcomes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM negotiation_script_variants
      WHERE id = script_variant_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own outcomes"
  ON negotiation_script_outcomes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM negotiation_script_variants
      WHERE id = script_variant_id AND user_id = auth.uid()
    )
  );

-- Create materialized view for analytics (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS script_variant_performance AS
SELECT
  v.selected_variant,
  v.merchant,
  COUNT(DISTINCT v.id) as selection_count,
  COUNT(DISTINCT o.id) as outcome_count,
  AVG(CASE WHEN o.was_successful THEN 1 ELSE 0 END) as success_rate,
  AVG(o.actual_savings) as avg_savings,
  AVG(o.user_rating) as avg_rating,
  MAX(v.created_at) as last_used
FROM negotiation_script_variants v
LEFT JOIN negotiation_script_outcomes o ON o.script_variant_id = v.id
WHERE v.selected_variant IS NOT NULL
GROUP BY v.selected_variant, v.merchant;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_variant_perf_variant ON script_variant_performance(selected_variant);
CREATE INDEX IF NOT EXISTS idx_variant_perf_merchant ON script_variant_performance(merchant);