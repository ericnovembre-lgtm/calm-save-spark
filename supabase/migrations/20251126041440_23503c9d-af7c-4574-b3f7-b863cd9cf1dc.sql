-- Conversation context table for tracking page awareness
CREATE TABLE IF NOT EXISTS conversation_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  page_route TEXT NOT NULL,
  page_context JSONB,
  captured_at TIMESTAMPTZ DEFAULT now()
);

-- Voice session tracking
CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ DEFAULT now(),
  session_end TIMESTAMPTZ,
  total_duration_ms INTEGER,
  turns_count INTEGER DEFAULT 0,
  metadata JSONB
);

-- Smart starters cache
CREATE TABLE IF NOT EXISTS conversation_starters_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  starters JSONB NOT NULL,
  context_hash TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 hour')
);

-- Enable RLS
ALTER TABLE conversation_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_starters_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own conversation contexts"
  ON conversation_contexts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own voice sessions"
  ON voice_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own starters cache"
  ON conversation_starters_cache FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_conversation_contexts_user_id ON conversation_contexts(user_id);
CREATE INDEX idx_conversation_contexts_conversation_id ON conversation_contexts(conversation_id);
CREATE INDEX idx_voice_sessions_user_id ON voice_sessions(user_id);
CREATE INDEX idx_conversation_starters_cache_user_id ON conversation_starters_cache(user_id);
CREATE INDEX idx_conversation_starters_cache_expires_at ON conversation_starters_cache(expires_at);