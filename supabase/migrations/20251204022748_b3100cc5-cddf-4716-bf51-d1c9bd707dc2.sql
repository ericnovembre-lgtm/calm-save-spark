-- Add reasoning_tokens column to ai_model_routing_analytics for Deepseek tracking
ALTER TABLE public.ai_model_routing_analytics 
ADD COLUMN IF NOT EXISTS reasoning_tokens integer DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.ai_model_routing_analytics.reasoning_tokens IS 'Reasoning tokens used by Deepseek model (separate from completion tokens)';