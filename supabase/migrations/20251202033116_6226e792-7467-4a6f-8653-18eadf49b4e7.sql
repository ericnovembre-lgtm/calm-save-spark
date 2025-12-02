-- Create ai_model_routing_analytics table
CREATE TABLE IF NOT EXISTS ai_model_routing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  query_type TEXT NOT NULL,
  model_used TEXT NOT NULL,
  was_fallback BOOLEAN DEFAULT FALSE,
  fallback_reason TEXT,
  response_time_ms INTEGER,
  token_count INTEGER,
  estimated_cost DECIMAL(10, 6),
  actual_cost DECIMAL(10, 6),
  confidence_score DECIMAL(3, 2),
  query_length INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ai_routing_user_date ON ai_model_routing_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_routing_model ON ai_model_routing_analytics(model_used);
CREATE INDEX IF NOT EXISTS idx_ai_routing_conversation ON ai_model_routing_analytics(conversation_id);

-- Enable RLS
ALTER TABLE ai_model_routing_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own routing analytics"
  ON ai_model_routing_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert routing analytics"
  ON ai_model_routing_analytics FOR INSERT
  WITH CHECK (true);

-- Add ai_model_preferences column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS ai_model_preferences JSONB DEFAULT '{
  "auto_routing_enabled": true,
  "preferred_model": null,
  "force_model_for_simple": null,
  "force_model_for_complex": null,
  "force_model_for_market": null,
  "cost_optimization_level": "balanced"
}'::jsonb;