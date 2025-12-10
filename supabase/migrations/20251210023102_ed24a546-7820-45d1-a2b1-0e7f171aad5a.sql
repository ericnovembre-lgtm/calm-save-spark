-- =============================================
-- Phase 1: High Priority Pages Database Schema
-- Financial Pulse, Expense Split, Wishlist Tracker
-- =============================================

-- =============================================
-- EXPENSE SPLIT TABLES
-- =============================================

-- Split Groups (e.g., "Roommates", "Trip to Paris")
CREATE TABLE public.split_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '👥',
  color TEXT DEFAULT '#d6c8a2',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Split Group Members
CREATE TABLE public.split_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.split_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  nickname TEXT,
  email TEXT,
  is_registered BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Split Expenses
CREATE TABLE public.split_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.split_groups(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  paid_by UUID NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT DEFAULT 'general',
  receipt_url TEXT,
  notes TEXT,
  is_settled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Split Participants (who owes what for each expense)
CREATE TABLE public.split_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES public.split_expenses(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.split_group_members(id) ON DELETE CASCADE,
  share_amount DECIMAL(12,2) NOT NULL,
  share_percentage DECIMAL(5,2),
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Split Settlements (payments between members)
CREATE TABLE public.split_settlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.split_groups(id) ON DELETE CASCADE,
  from_member_id UUID NOT NULL REFERENCES public.split_group_members(id),
  to_member_id UUID NOT NULL REFERENCES public.split_group_members(id),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  settled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- WISHLIST TRACKER TABLE
-- =============================================

CREATE TABLE public.wishlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(12,2) NOT NULL,
  saved_amount DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  category TEXT DEFAULT 'general',
  image_url TEXT,
  product_url TEXT,
  target_date DATE,
  is_purchased BOOLEAN DEFAULT false,
  purchased_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- FINANCIAL PULSE CACHE TABLE
-- =============================================

CREATE TABLE public.financial_pulse_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  pulse_data JSONB NOT NULL DEFAULT '{}',
  health_score INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.split_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_pulse_cache ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - SPLIT GROUPS
-- =============================================

CREATE POLICY "Users can view groups they created or are members of"
ON public.split_groups FOR SELECT
USING (
  created_by = auth.uid() OR
  id IN (SELECT group_id FROM public.split_group_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create groups"
ON public.split_groups FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators can update their groups"
ON public.split_groups FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Group creators can delete their groups"
ON public.split_groups FOR DELETE
USING (created_by = auth.uid());

-- =============================================
-- RLS POLICIES - SPLIT GROUP MEMBERS
-- =============================================

CREATE POLICY "Users can view members of their groups"
ON public.split_group_members FOR SELECT
USING (
  group_id IN (
    SELECT id FROM public.split_groups WHERE created_by = auth.uid()
    UNION
    SELECT group_id FROM public.split_group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Group creators can add members"
ON public.split_group_members FOR INSERT
WITH CHECK (
  group_id IN (SELECT id FROM public.split_groups WHERE created_by = auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Group creators can update members"
ON public.split_group_members FOR UPDATE
USING (
  group_id IN (SELECT id FROM public.split_groups WHERE created_by = auth.uid())
);

CREATE POLICY "Group creators can remove members"
ON public.split_group_members FOR DELETE
USING (
  group_id IN (SELECT id FROM public.split_groups WHERE created_by = auth.uid())
  OR user_id = auth.uid()
);

-- =============================================
-- RLS POLICIES - SPLIT EXPENSES
-- =============================================

CREATE POLICY "Users can view expenses in their groups"
ON public.split_expenses FOR SELECT
USING (
  group_id IN (
    SELECT id FROM public.split_groups WHERE created_by = auth.uid()
    UNION
    SELECT group_id FROM public.split_group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Group members can create expenses"
ON public.split_expenses FOR INSERT
WITH CHECK (
  group_id IN (
    SELECT id FROM public.split_groups WHERE created_by = auth.uid()
    UNION
    SELECT group_id FROM public.split_group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Expense creators can update"
ON public.split_expenses FOR UPDATE
USING (paid_by = auth.uid());

CREATE POLICY "Expense creators can delete"
ON public.split_expenses FOR DELETE
USING (paid_by = auth.uid());

-- =============================================
-- RLS POLICIES - SPLIT PARTICIPANTS
-- =============================================

CREATE POLICY "Users can view participants in their expenses"
ON public.split_participants FOR SELECT
USING (
  expense_id IN (
    SELECT id FROM public.split_expenses WHERE group_id IN (
      SELECT id FROM public.split_groups WHERE created_by = auth.uid()
      UNION
      SELECT group_id FROM public.split_group_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can add participants to expenses they created"
ON public.split_participants FOR INSERT
WITH CHECK (
  expense_id IN (SELECT id FROM public.split_expenses WHERE paid_by = auth.uid())
);

CREATE POLICY "Users can update participants"
ON public.split_participants FOR UPDATE
USING (
  expense_id IN (SELECT id FROM public.split_expenses WHERE paid_by = auth.uid())
);

CREATE POLICY "Users can delete participants"
ON public.split_participants FOR DELETE
USING (
  expense_id IN (SELECT id FROM public.split_expenses WHERE paid_by = auth.uid())
);

-- =============================================
-- RLS POLICIES - SPLIT SETTLEMENTS
-- =============================================

CREATE POLICY "Users can view settlements in their groups"
ON public.split_settlements FOR SELECT
USING (
  group_id IN (
    SELECT id FROM public.split_groups WHERE created_by = auth.uid()
    UNION
    SELECT group_id FROM public.split_group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create settlements"
ON public.split_settlements FOR INSERT
WITH CHECK (
  group_id IN (
    SELECT id FROM public.split_groups WHERE created_by = auth.uid()
    UNION
    SELECT group_id FROM public.split_group_members WHERE user_id = auth.uid()
  )
);

-- =============================================
-- RLS POLICIES - WISHLIST ITEMS
-- =============================================

CREATE POLICY "Users can view their own wishlist items"
ON public.wishlist_items FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create wishlist items"
ON public.wishlist_items FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their wishlist items"
ON public.wishlist_items FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their wishlist items"
ON public.wishlist_items FOR DELETE
USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES - FINANCIAL PULSE CACHE
-- =============================================

CREATE POLICY "Users can view their pulse cache"
ON public.financial_pulse_cache FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their pulse cache"
ON public.financial_pulse_cache FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their pulse cache"
ON public.financial_pulse_cache FOR UPDATE
USING (user_id = auth.uid());

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_split_groups_created_by ON public.split_groups(created_by);
CREATE INDEX idx_split_group_members_group_id ON public.split_group_members(group_id);
CREATE INDEX idx_split_group_members_user_id ON public.split_group_members(user_id);
CREATE INDEX idx_split_expenses_group_id ON public.split_expenses(group_id);
CREATE INDEX idx_split_expenses_paid_by ON public.split_expenses(paid_by);
CREATE INDEX idx_split_participants_expense_id ON public.split_participants(expense_id);
CREATE INDEX idx_split_settlements_group_id ON public.split_settlements(group_id);
CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX idx_wishlist_items_priority ON public.wishlist_items(priority);
CREATE INDEX idx_financial_pulse_cache_user_id ON public.financial_pulse_cache(user_id);

-- =============================================
-- ENABLE REALTIME FOR COLLABORATIVE FEATURES
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.split_expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.split_settlements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wishlist_items;

-- =============================================
-- UPDATE TIMESTAMP TRIGGERS
-- =============================================

CREATE TRIGGER update_split_groups_updated_at
BEFORE UPDATE ON public.split_groups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_split_expenses_updated_at
BEFORE UPDATE ON public.split_expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at
BEFORE UPDATE ON public.wishlist_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_pulse_cache_updated_at
BEFORE UPDATE ON public.financial_pulse_cache
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();