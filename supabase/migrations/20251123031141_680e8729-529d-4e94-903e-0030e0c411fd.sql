-- Create AI CFO sessions table
CREATE TABLE ai_cfo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_history JSONB DEFAULT '[]'::jsonb,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cfo_sessions_user ON ai_cfo_sessions(user_id);

-- RLS policies for ai_cfo_sessions
ALTER TABLE ai_cfo_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own CFO sessions"
  ON ai_cfo_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CFO sessions"
  ON ai_cfo_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CFO sessions"
  ON ai_cfo_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create liquidity health analyses table
CREATE TABLE liquidity_health_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  health_score INTEGER NOT NULL,
  score_label TEXT NOT NULL,
  strengths JSONB NOT NULL,
  risks JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  summary TEXT NOT NULL,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_analyses_user_date ON liquidity_health_analyses(user_id, analyzed_at DESC);

-- RLS policies for liquidity_health_analyses
ALTER TABLE liquidity_health_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health analyses"
  ON liquidity_health_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health analyses"
  ON liquidity_health_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);