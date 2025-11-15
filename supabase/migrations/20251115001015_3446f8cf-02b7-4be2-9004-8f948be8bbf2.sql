-- Goal display preferences
CREATE TABLE IF NOT EXISTS goal_preferences (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_order UUID[] DEFAULT '{}',
  view_mode TEXT DEFAULT 'grid' CHECK (view_mode IN ('grid', 'stack', 'list')),
  animation_intensity TEXT DEFAULT 'full' CHECK (animation_intensity IN ('none', 'reduced', 'full')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE goal_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON goal_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON goal_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON goal_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Milestone tracking
CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  milestone_percentage INTEGER NOT NULL,
  celebration_type TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own milestones"
  ON goal_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones"
  ON goal_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
  ON goal_milestones FOR UPDATE
  USING (auth.uid() = user_id);

-- Achievement unlocks
CREATE TABLE IF NOT EXISTS goal_achievement_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  animation_viewed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE goal_achievement_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own unlocks"
  ON goal_achievement_unlocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unlocks"
  ON goal_achievement_unlocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own unlocks"
  ON goal_achievement_unlocks FOR UPDATE
  USING (auth.uid() = user_id);