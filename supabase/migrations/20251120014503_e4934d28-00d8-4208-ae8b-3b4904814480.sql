-- Phase 1: Foundation - Database Schema

-- Long-term memory for personalized agent interactions
CREATE TABLE public.agent_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('preference', 'fact', 'goal', 'style', 'context')),
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  confidence_score FLOAT DEFAULT 1.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_type, memory_type, key)
);

-- Proactive nudges from agents
CREATE TABLE public.agent_nudges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  nudge_type TEXT NOT NULL,
  message TEXT NOT NULL,
  priority INT DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  trigger_data JSONB,
  action_url TEXT,
  sent_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  acted_on_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tool execution logs for observability
CREATE TABLE public.tool_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  input_params JSONB,
  output_data JSONB,
  execution_time_ms INT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent consultation logs for multi-agent coordination
CREATE TABLE public.agent_consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requesting_agent TEXT NOT NULL,
  consulting_agent TEXT NOT NULL,
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Uploaded documents for analysis
CREATE TABLE public.agent_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes INT NOT NULL,
  storage_path TEXT NOT NULL,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzing', 'completed', 'failed')),
  analysis_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  analyzed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_agent_memory_user_agent ON public.agent_memory(user_id, agent_type);
CREATE INDEX idx_agent_memory_type ON public.agent_memory(memory_type);
CREATE INDEX idx_agent_nudges_user_unsent ON public.agent_nudges(user_id, sent_at) WHERE sent_at IS NULL;
CREATE INDEX idx_agent_nudges_expires ON public.agent_nudges(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_tool_logs_conversation ON public.tool_execution_logs(conversation_id);
CREATE INDEX idx_tool_logs_created ON public.tool_execution_logs(created_at DESC);
CREATE INDEX idx_agent_documents_user ON public.agent_documents(user_id, created_at DESC);
CREATE INDEX idx_agent_documents_conversation ON public.agent_documents(conversation_id);

-- RLS Policies
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_documents ENABLE ROW LEVEL SECURITY;

-- Agent Memory Policies
CREATE POLICY "Users can view their own agent memory"
  ON public.agent_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent memory"
  ON public.agent_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent memory"
  ON public.agent_memory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent memory"
  ON public.agent_memory FOR DELETE
  USING (auth.uid() = user_id);

-- Agent Nudges Policies
CREATE POLICY "Users can view their own nudges"
  ON public.agent_nudges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own nudges"
  ON public.agent_nudges FOR UPDATE
  USING (auth.uid() = user_id);

-- Tool Execution Logs Policies (read-only for users)
CREATE POLICY "Users can view logs for their conversations"
  ON public.tool_execution_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = tool_execution_logs.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- Agent Consultations Policies (read-only for users)
CREATE POLICY "Users can view consultations for their conversations"
  ON public.agent_consultations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = agent_consultations.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- Agent Documents Policies
CREATE POLICY "Users can view their own documents"
  ON public.agent_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON public.agent_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON public.agent_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.agent_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Update timestamp trigger for agent_memory
CREATE OR REPLACE FUNCTION public.update_agent_memory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_memory_timestamp
  BEFORE UPDATE ON public.agent_memory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_memory_timestamp();

-- Function to cleanup expired nudges
CREATE OR REPLACE FUNCTION public.cleanup_expired_nudges()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.agent_nudges
  WHERE expires_at IS NOT NULL
    AND expires_at < now()
    AND acted_on_at IS NULL;
END;
$$;

-- Function to get active nudges for user
CREATE OR REPLACE FUNCTION public.get_active_nudges(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  agent_type TEXT,
  nudge_type TEXT,
  message TEXT,
  priority INT,
  action_url TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, agent_type, nudge_type, message, priority, action_url, created_at
  FROM public.agent_nudges
  WHERE user_id = p_user_id
    AND sent_at IS NULL
    AND (expires_at IS NULL OR expires_at > now())
    AND dismissed_at IS NULL
  ORDER BY priority DESC, created_at ASC
  LIMIT 5;
$$;