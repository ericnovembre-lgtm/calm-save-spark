-- Enhance automation_rules table with scheduling fields
ALTER TABLE public.automation_rules
ADD COLUMN IF NOT EXISTS frequency TEXT CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS next_run_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_run_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS run_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_rules_user_active 
  ON automation_rules(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_automation_rules_next_run 
  ON automation_rules(next_run_date) 
  WHERE is_active = true;

-- Create automation_execution_log table
CREATE TABLE IF NOT EXISTS public.automation_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('success', 'failed', 'skipped')),
  amount_transferred NUMERIC(10, 2),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_automation_log_rule ON automation_execution_log(automation_rule_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_log_user ON automation_execution_log(user_id, executed_at DESC);

-- RLS Policies for automation_execution_log
ALTER TABLE automation_execution_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own execution logs"
  ON automation_execution_log FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON COLUMN automation_rules.trigger_condition IS 
  'JSON with: type (scheduled/balance_threshold), conditions (min_balance, etc)';