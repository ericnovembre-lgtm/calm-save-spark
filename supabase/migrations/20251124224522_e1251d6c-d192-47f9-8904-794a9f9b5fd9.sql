-- Add portfolio allocation targets to user preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS portfolio_allocation_target jsonb DEFAULT '{"brokerage": 60, "investment": 60, "bond": 30, "fixed": 30, "cash": 10, "crypto": 0}'::jsonb;

-- Create portfolio goals table
CREATE TABLE IF NOT EXISTS portfolio_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal_name text NOT NULL,
  goal_type text NOT NULL, -- 'retirement', 'emergency_fund', 'house', 'education', 'custom'
  target_amount numeric NOT NULL,
  current_amount numeric DEFAULT 0,
  deadline timestamp with time zone,
  icon text,
  color text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on portfolio_goals
ALTER TABLE portfolio_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for portfolio_goals
CREATE POLICY "Users can view their own portfolio goals"
  ON portfolio_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio goals"
  ON portfolio_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio goals"
  ON portfolio_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio goals"
  ON portfolio_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_portfolio_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolio_goals_updated_at
  BEFORE UPDATE ON portfolio_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_goals_updated_at();

-- Enable realtime for market_data_cache
ALTER PUBLICATION supabase_realtime ADD TABLE market_data_cache;