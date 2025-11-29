-- Create table for Claude API metrics
CREATE TABLE public.claude_api_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT,
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE SET NULL,
  user_id UUID,
  agent_type TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'claude-sonnet-4-5',
  
  -- Performance metrics
  latency_ms INTEGER NOT NULL,
  time_to_first_token_ms INTEGER,
  total_stream_time_ms INTEGER,
  
  -- Token usage
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'rate_limited')),
  error_type TEXT,
  error_message TEXT,
  
  -- Rate limit info
  rate_limit_remaining INTEGER,
  rate_limit_reset TIMESTAMPTZ,
  
  -- Tool usage
  tools_used TEXT[],
  tool_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX idx_claude_metrics_created_at ON public.claude_api_metrics(created_at DESC);
CREATE INDEX idx_claude_metrics_status ON public.claude_api_metrics(status);
CREATE INDEX idx_claude_metrics_agent_type ON public.claude_api_metrics(agent_type);
CREATE INDEX idx_claude_metrics_user_id ON public.claude_api_metrics(user_id);

-- Enable RLS
ALTER TABLE public.claude_api_metrics ENABLE ROW LEVEL SECURITY;

-- Admin-only read access
CREATE POLICY "Admin can view all metrics" ON public.claude_api_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Allow service role/edge functions to insert metrics
CREATE POLICY "Service can insert metrics" ON public.claude_api_metrics
  FOR INSERT WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.claude_api_metrics IS 'Tracks Claude API performance metrics, errors, and usage statistics';