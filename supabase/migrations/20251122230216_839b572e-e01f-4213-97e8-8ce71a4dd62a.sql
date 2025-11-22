-- Create automation templates table
CREATE TABLE IF NOT EXISTS automation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT CHECK (category IN ('savings', 'micro-savings', 'optimization', 'protection')),
  trigger_config JSONB NOT NULL,
  action_config JSONB NOT NULL,
  popularity_score INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE automation_templates ENABLE ROW LEVEL SECURITY;

-- Public read access for templates
CREATE POLICY "Templates are publicly readable"
  ON automation_templates FOR SELECT
  USING (true);

-- Insert pre-built smart recipes
INSERT INTO automation_templates (name, description, icon, category, trigger_config, action_config, popularity_score) VALUES
  ('The Sweeper', 'Move excess funds >$1000 to savings at month-end', 'Broom', 'savings', 
   '{"type":"balance_threshold","threshold":1000,"frequency":"monthly"}',
   '{"type":"transfer_to_goal","amount_type":"excess"}', 100),
   
  ('Round-Up Pro', 'Round up every purchase to nearest $1, invest difference', 'Coins', 'micro-savings',
   '{"type":"transaction_match","round_up":true,"all_transactions":true}',
   '{"type":"transfer_to_goal","round_up_enabled":true}', 95),
   
  ('Inflation Fighter', 'Auto-increase savings by 1% monthly', 'TrendingUp', 'optimization',
   '{"type":"date_based","frequency":"monthly","day_of_month":1}',
   '{"type":"adjust_amount","percentage_increase":1}', 90),
   
  ('Payday Routine', 'Split income 50/30/20 on paydays', 'CalendarCheck', 'savings',
   '{"type":"date_based","frequency":"bi-weekly","day_of_week":"friday"}',
   '{"type":"split_transfer","splits":[{"percentage":50,"target":"checking"},{"percentage":30,"target":"wants"},{"percentage":20,"target":"savings"}]}', 85),
   
  ('Coffee Tax', 'Save $3 every coffee purchase', 'Coffee', 'micro-savings',
   '{"type":"transaction_match","category":"coffee","merchant_pattern":"starbucks|dunkin|coffee"}',
   '{"type":"transfer_to_pot","amount":3}', 80);

-- Enable realtime for automation_execution_log
ALTER PUBLICATION supabase_realtime ADD TABLE automation_execution_log;