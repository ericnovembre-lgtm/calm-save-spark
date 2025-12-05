-- Add missing columns to budget_comments
ALTER TABLE budget_comments ADD COLUMN IF NOT EXISTS mentions UUID[] DEFAULT '{}';
ALTER TABLE budget_comments ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN DEFAULT false;
ALTER TABLE budget_comments ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE budget_comments ADD COLUMN IF NOT EXISTS resolved_by UUID;

-- Create budget_presence table
CREATE TABLE IF NOT EXISTS budget_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES user_budgets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  cursor_position JSONB,
  UNIQUE(budget_id, user_id)
);

-- Create households table
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  avatar_url TEXT,
  settings JSONB DEFAULT '{}'
);

-- Create household_members table
CREATE TABLE IF NOT EXISTS household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  invited_by UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invite_email TEXT,
  UNIQUE(household_id, user_id)
);

-- Enable RLS on all new tables
ALTER TABLE budget_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for budget_presence
CREATE POLICY "Users can view presence for budgets they access" ON budget_presence
  FOR SELECT USING (
    budget_id IN (
      SELECT id FROM user_budgets WHERE user_id = auth.uid()
      UNION
      SELECT budget_id FROM budget_shares WHERE shared_with_user_id = auth.uid() AND status = 'accepted'
    )
  );

CREATE POLICY "Users can manage their own presence" ON budget_presence
  FOR ALL USING (user_id = auth.uid());

-- RLS policies for households
CREATE POLICY "Users can view households they belong to" ON households
  FOR SELECT USING (
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can create households" ON households
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Household owners/admins can update" ON households
  FOR UPDATE USING (
    created_by = auth.uid()
    OR id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Only creators can delete households" ON households
  FOR DELETE USING (created_by = auth.uid());

-- RLS policies for household_members
CREATE POLICY "Members can view their household members" ON household_members
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
  );

CREATE POLICY "Owners/admins can manage members" ON household_members
  FOR INSERT WITH CHECK (
    household_id IN (
      SELECT id FROM households WHERE created_by = auth.uid()
      UNION
      SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Members can update their own status" ON household_members
  FOR UPDATE USING (user_id = auth.uid() OR invited_by = auth.uid());

CREATE POLICY "Owners/admins can delete members" ON household_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR household_id IN (
      SELECT id FROM households WHERE created_by = auth.uid()
      UNION
      SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Enable realtime for budget_presence
ALTER PUBLICATION supabase_realtime ADD TABLE budget_presence;