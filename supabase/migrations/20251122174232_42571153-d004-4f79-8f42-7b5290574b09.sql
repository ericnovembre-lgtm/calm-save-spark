-- Add visual and time-to-goal columns to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS visual_url TEXT;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS visual_prompt TEXT;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS time_to_goal_suggestions JSONB;

-- Create goal visuals cache table
CREATE TABLE IF NOT EXISTS goal_visuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_name TEXT NOT NULL,
  prompt_used TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_name, prompt_used)
);

-- Create goal transactions table for ACID-compliant updates
CREATE TABLE IF NOT EXISTS goal_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE goal_visuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for goal_transactions
CREATE POLICY "Users can view own transactions"
  ON goal_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON goal_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for goal_visuals (public read, system write)
CREATE POLICY "Anyone can read goal visuals"
  ON goal_visuals FOR SELECT
  USING (true);

-- Create atomic contribution function
CREATE OR REPLACE FUNCTION contribute_to_goal(
  p_goal_id UUID,
  p_amount NUMERIC,
  p_user_id UUID,
  p_note TEXT
) RETURNS TABLE (
  new_amount NUMERIC,
  is_completed BOOLEAN
) AS $$
DECLARE
  v_new_amount NUMERIC;
  v_target NUMERIC;
  v_current NUMERIC;
BEGIN
  -- Lock row for update
  SELECT current_amount, target_amount
  INTO v_current, v_target
  FROM goals
  WHERE id = p_goal_id AND user_id = p_user_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Goal not found or access denied';
  END IF;
  
  -- Calculate new amount
  v_new_amount := LEAST(v_current + p_amount, v_target);
  
  -- Update goal
  UPDATE goals
  SET current_amount = v_new_amount,
      updated_at = NOW()
  WHERE id = p_goal_id;
  
  -- Log transaction
  INSERT INTO goal_transactions (goal_id, user_id, amount, note, created_at)
  VALUES (p_goal_id, p_user_id, p_amount, p_note, NOW());
  
  RETURN QUERY SELECT v_new_amount, (v_new_amount >= v_target);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goal_transactions_goal_id ON goal_transactions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_transactions_user_id ON goal_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_visuals_goal_name ON goal_visuals(goal_name);