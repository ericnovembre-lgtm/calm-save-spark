-- Financial Questlines Tables
CREATE TABLE IF NOT EXISTS financial_questlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  narrative_intro TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_points INTEGER DEFAULT 0,
  badge_reward UUID REFERENCES achievements(id),
  category TEXT CHECK (category IN ('debt_slay', 'home_horizon', 'savings_sprint', 'credit_builder')),
  icon TEXT DEFAULT 'trophy',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_questline_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questline_id UUID NOT NULL REFERENCES financial_questlines(id),
  current_step INTEGER DEFAULT 1,
  steps_completed JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, questline_id)
);

-- Geo Reward Partners Tables
CREATE TABLE IF NOT EXISTS geo_reward_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  current_multiplier DECIMAL(3,1) DEFAULT 1.0,
  multiplier_end_time TIMESTAMPTZ,
  bonus_type TEXT CHECK (bonus_type IN ('points', 'cashback', 'freeze_day')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_geo_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES geo_reward_partners(id),
  points_earned INTEGER DEFAULT 0,
  transaction_date TIMESTAMPTZ DEFAULT now()
);

-- Collaborative Goals Tables
CREATE TABLE IF NOT EXISTS collaborative_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2),
  current_amount DECIMAL(10,2) DEFAULT 0,
  goal_type TEXT CHECK (goal_type IN ('savings', 'budget', 'challenge')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  deadline TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS collaborative_goal_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES collaborative_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution DECIMAL(10,2) DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(goal_id, user_id)
);

-- Enable RLS
ALTER TABLE financial_questlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_questline_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_reward_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_geo_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_goal_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_questlines
CREATE POLICY "Anyone can view active questlines" ON financial_questlines
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_questline_progress
CREATE POLICY "Users can view own questline progress" ON user_questline_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questline progress" ON user_questline_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questline progress" ON user_questline_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for geo_reward_partners
CREATE POLICY "Anyone can view active geo partners" ON geo_reward_partners
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_geo_rewards
CREATE POLICY "Users can view own geo rewards" ON user_geo_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own geo rewards" ON user_geo_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for collaborative_goals
CREATE POLICY "Users can view goals they're part of" ON collaborative_goals
  FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM collaborative_goal_members 
      WHERE goal_id = collaborative_goals.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create goals" ON collaborative_goals
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Goal creators can update" ON collaborative_goals
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for collaborative_goal_members
CREATE POLICY "Users can view goal members" ON collaborative_goal_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collaborative_goals 
      WHERE id = collaborative_goal_members.goal_id AND (created_by = auth.uid() OR id IN (
        SELECT goal_id FROM collaborative_goal_members WHERE user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Goal creators can add members" ON collaborative_goal_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM collaborative_goals 
      WHERE id = collaborative_goal_members.goal_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Members can update their contribution" ON collaborative_goal_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample questlines
INSERT INTO financial_questlines (name, description, narrative_intro, steps, total_points, category, icon) VALUES
('The Debt Slay Path', 'Master your debt and unlock financial freedom', 'Your journey to financial freedom begins here. Each step brings you closer to breaking free from the chains of debt.', 
'[
  {"step": 1, "title": "First Strike", "description": "Make your first on-time payment", "points": 50, "requirement": "on_time_payment_1"},
  {"step": 2, "title": "Building Momentum", "description": "Make three consecutive on-time payments", "points": 100, "requirement": "on_time_payment_3"},
  {"step": 3, "title": "Utilization Master", "description": "Keep credit utilization under 30%", "points": 150, "requirement": "utilization_under_30"},
  {"step": 4, "title": "Debt Slayer", "description": "Complete all steps for Discipline Boost", "points": 200, "requirement": "complete_all"}
]'::jsonb, 500, 'debt_slay', 'sword'),

('Home Horizon Track', 'Build your path to homeownership', 'Every home starts with a single saved dollar. This is the beginning of your home ownership journey.',
'[
  {"step": 1, "title": "Foundation", "description": "Create your first savings goal", "points": 25, "requirement": "create_goal"},
  {"step": 2, "title": "First Deposit", "description": "Make your first contribution", "points": 50, "requirement": "first_contribution"},
  {"step": 3, "title": "Consistency", "description": "Make five consecutive contributions", "points": 100, "requirement": "five_contributions"},
  {"step": 4, "title": "Milestone Reached", "description": "Reach 25% of your savings goal", "points": 150, "requirement": "reach_25_percent"},
  {"step": 5, "title": "Horizon Reached", "description": "Unlock Home Hero medallion", "points": 200, "requirement": "complete_all"}
]'::jsonb, 525, 'home_horizon', 'home'),

('Credit Builder Quest', 'Transform your credit score step by step', 'Building great credit is a marathon, not a sprint. Take it one step at a time.',
'[
  {"step": 1, "title": "Score Check", "description": "Check your credit score for the first time", "points": 25, "requirement": "check_score"},
  {"step": 2, "title": "Payment Streak", "description": "Maintain a 30-day payment streak", "points": 75, "requirement": "30_day_streak"},
  {"step": 3, "title": "Balance Keeper", "description": "Keep all balances below 30% for a month", "points": 125, "requirement": "low_utilization_month"},
  {"step": 4, "title": "Credit Hero", "description": "Improve your score by 50 points", "points": 200, "requirement": "score_improvement_50"}
]'::jsonb, 425, 'credit_builder', 'shield'),

('Savings Sprint Challenge', 'Accelerate your savings momentum', 'Speed and consistency—the twin engines of wealth building.',
'[
  {"step": 1, "title": "Quick Start", "description": "Save your first $100", "points": 50, "requirement": "save_100"},
  {"step": 2, "title": "Momentum", "description": "Save $500 in one month", "points": 100, "requirement": "save_500_month"},
  {"step": 3, "title": "Power Save", "description": "Save $1000 in total", "points": 150, "requirement": "save_1000_total"},
  {"step": 4, "title": "Sprint Champion", "description": "Maintain a 60-day savings streak", "points": 200, "requirement": "60_day_streak"}
]'::jsonb, 500, 'savings_sprint', 'zap');

-- Insert sample geo partners
INSERT INTO geo_reward_partners (name, category, latitude, longitude, address, current_multiplier, multiplier_end_time, bonus_type, is_active) VALUES
('Corner Market', 'groceries', 40.7128, -74.0060, '123 Main St, New York, NY', 2.0, NOW() + INTERVAL '4 hours', 'points', true),
('QuickFill Gas Station', 'gas', 40.7580, -73.9855, '456 Broadway, New York, NY', 1.5, NOW() + INTERVAL '6 hours', 'cashback', true),
('Community Credit Union', 'financial', 40.7489, -73.9680, '789 Park Ave, New York, NY', 3.0, NOW() + INTERVAL '8 hours', 'freeze_day', true),
('Fresh Foods Market', 'groceries', 40.7614, -73.9776, '321 5th Ave, New York, NY', 1.5, NOW() + INTERVAL '3 hours', 'points', true),
('Downtown Diner', 'dining', 40.7282, -74.0776, '555 Restaurant Row, New York, NY', 2.5, NOW() + INTERVAL '5 hours', 'points', true);