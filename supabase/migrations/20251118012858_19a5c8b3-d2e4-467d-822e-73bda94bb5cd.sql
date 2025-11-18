-- Enhance streak system in profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_check_ins INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freeze_available INTEGER DEFAULT 0;

-- Create user achievements unlocked table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  leaderboard_type VARCHAR(50) NOT NULL,
  score DECIMAL(10, 2) NOT NULL,
  rank INTEGER,
  period VARCHAR(20) NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  display_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, leaderboard_type, period)
);

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view visible leaderboard entries"
  ON leaderboard_entries FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Users can insert their own entries"
  ON leaderboard_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON leaderboard_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Create savings milestones table
CREATE TABLE IF NOT EXISTS savings_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  milestone_percentage INTEGER NOT NULL,
  milestone_amount DECIMAL(10, 2) NOT NULL,
  reached_at TIMESTAMPTZ,
  is_celebrated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE savings_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own milestones"
  ON savings_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own milestones"
  ON savings_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
  ON savings_milestones FOR UPDATE
  USING (auth.uid() = user_id);

-- Create weekly insights table
CREATE TABLE IF NOT EXISTS weekly_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_saved DECIMAL(10, 2),
  total_spent DECIMAL(10, 2),
  budget_adherence_score INTEGER,
  top_category VARCHAR(100),
  insights JSONB,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own insights"
  ON weekly_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert insights"
  ON weekly_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON weekly_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- Add challenge progress tracking enhancements
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS milestones_reached JSONB DEFAULT '[]'::jsonb;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS days_active INTEGER DEFAULT 0;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_type_period ON leaderboard_entries(leaderboard_type, period, rank);
CREATE INDEX IF NOT EXISTS idx_savings_milestones_user_goal ON savings_milestones(user_id, goal_id);
CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_week ON weekly_insights(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id, rank);