-- Create A/B testing tables for AI model comparison
CREATE TABLE IF NOT EXISTS public.ai_model_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  model_a TEXT NOT NULL,
  model_b TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  traffic_split DECIMAL DEFAULT 0.5, -- 50/50 split by default
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_model_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.ai_model_ab_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  agent_type TEXT NOT NULL,
  model_used TEXT NOT NULL,
  conversation_id UUID REFERENCES public.ai_conversations(id),
  response_time_ms INTEGER,
  token_count INTEGER,
  user_feedback INTEGER CHECK (user_feedback BETWEEN 1 AND 5),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_model_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_test_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for A/B tests (admin only for configuration)
CREATE POLICY "Admins can manage A/B tests"
  ON public.ai_model_ab_tests
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- RLS policies for test results (users can view their own)
CREATE POLICY "Users can view their own test results"
  ON public.ai_model_test_results
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert test results"
  ON public.ai_model_test_results
  FOR INSERT
  WITH CHECK (true);

-- Insert initial A/B test for Tax Assistant
INSERT INTO public.ai_model_ab_tests (test_name, agent_type, model_a, model_b, is_active)
VALUES ('Tax Assistant Model Comparison', 'tax_assistant', 'openai/gpt-5', 'google/gemini-2.5-pro', true);

-- Create indexes for performance
CREATE INDEX idx_ab_tests_agent_type ON public.ai_model_ab_tests(agent_type, is_active);
CREATE INDEX idx_test_results_test_id ON public.ai_model_test_results(test_id);
CREATE INDEX idx_test_results_user_id ON public.ai_model_test_results(user_id);
CREATE INDEX idx_test_results_created_at ON public.ai_model_test_results(created_at);