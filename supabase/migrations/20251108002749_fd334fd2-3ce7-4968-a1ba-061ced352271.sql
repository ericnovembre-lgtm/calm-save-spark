-- ============================================================================
-- PHASE 2: Family Features & Student Features
-- ============================================================================

-- ============================================================================
-- 1. FAMILY FEATURES
-- ============================================================================

-- Family/Household groups
CREATE TABLE IF NOT EXISTS public.family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Family member roles: 'parent', 'child', 'partner'
CREATE TYPE public.family_role AS ENUM ('parent', 'child', 'partner');

-- Family members (many-to-many between users and groups)
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.family_role NOT NULL DEFAULT 'partner',
  permissions JSONB DEFAULT '{"can_view": true, "can_edit": false, "can_delete": false}',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_group_id, user_id)
);

-- Shared family budgets
CREATE TABLE IF NOT EXISTS public.family_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  period TEXT NOT NULL,
  total_limit NUMERIC NOT NULL,
  category_limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Family expenses (shared tracking)
CREATE TABLE IF NOT EXISTS public.family_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  expense_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allowances for children
CREATE TABLE IF NOT EXISTS public.allowances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  child_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'weekly',
  is_active BOOLEAN DEFAULT true,
  next_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on family tables
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_groups
CREATE POLICY "Users can view groups they belong to"
  ON public.family_groups FOR SELECT
  USING (
    id IN (
      SELECT family_group_id FROM public.family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups"
  ON public.family_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update groups"
  ON public.family_groups FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete groups"
  ON public.family_groups FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for family_members
CREATE POLICY "Members can view family members"
  ON public.family_members FOR SELECT
  USING (
    family_group_id IN (
      SELECT family_group_id FROM public.family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can add family members"
  ON public.family_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_group_id = family_members.family_group_id
        AND user_id = auth.uid()
        AND role = 'parent'
    )
  );

CREATE POLICY "Parents can update family members"
  ON public.family_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.family_group_id = family_members.family_group_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'parent'
    )
  );

CREATE POLICY "Parents can remove family members"
  ON public.family_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.family_group_id = family_members.family_group_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'parent'
    )
  );

-- RLS Policies for family_budgets
CREATE POLICY "Family members can view family budgets"
  ON public.family_budgets FOR SELECT
  USING (
    family_group_id IN (
      SELECT family_group_id FROM public.family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can manage family budgets"
  ON public.family_budgets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_group_id = family_budgets.family_group_id
        AND user_id = auth.uid()
        AND role = 'parent'
    )
  );

-- RLS Policies for family_expenses
CREATE POLICY "Family members can view family expenses"
  ON public.family_expenses FOR SELECT
  USING (
    family_group_id IN (
      SELECT family_group_id FROM public.family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family members can add expenses"
  ON public.family_expenses FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    family_group_id IN (
      SELECT family_group_id FROM public.family_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for allowances
CREATE POLICY "Family members can view allowances"
  ON public.allowances FOR SELECT
  USING (
    family_group_id IN (
      SELECT family_group_id FROM public.family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can manage allowances"
  ON public.allowances FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_group_id = allowances.family_group_id
        AND user_id = auth.uid()
        AND role = 'parent'
    )
  );

-- ============================================================================
-- 2. STUDENT FEATURES
-- ============================================================================

-- Student profiles
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name TEXT,
  graduation_year INTEGER,
  degree_program TEXT,
  student_status TEXT DEFAULT 'enrolled',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scholarships and grants tracking
CREATE TABLE IF NOT EXISTS public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT,
  amount NUMERIC NOT NULL,
  award_date TIMESTAMPTZ,
  disbursement_schedule TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Student loans tracking
CREATE TABLE IF NOT EXISTS public.student_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_name TEXT NOT NULL,
  loan_type TEXT,
  lender TEXT,
  principal_amount NUMERIC NOT NULL,
  current_balance NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  repayment_plan TEXT,
  grace_period_end TIMESTAMPTZ,
  monthly_payment NUMERIC,
  status TEXT DEFAULT 'in_school',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Part-time income tracking for students
CREATE TABLE IF NOT EXISTS public.student_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  income_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Student budget templates
CREATE TABLE IF NOT EXISTS public.student_budget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_allocations JSONB NOT NULL,
  total_budget NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on student tables
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_budget_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_profiles
CREATE POLICY "Users can view own student profile"
  ON public.student_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own student profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own student profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for scholarships
CREATE POLICY "Users can view own scholarships"
  ON public.scholarships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scholarships"
  ON public.scholarships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scholarships"
  ON public.scholarships FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scholarships"
  ON public.scholarships FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for student_loans
CREATE POLICY "Users can view own student loans"
  ON public.student_loans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own student loans"
  ON public.student_loans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own student loans"
  ON public.student_loans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own student loans"
  ON public.student_loans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for student_income
CREATE POLICY "Users can view own student income"
  ON public.student_income FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own student income"
  ON public.student_income FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for student_budget_templates (public read)
CREATE POLICY "Anyone can view student budget templates"
  ON public.student_budget_templates FOR SELECT
  USING (true);

-- ============================================================================
-- 3. SEED DATA FOR STUDENT TEMPLATES
-- ============================================================================

INSERT INTO public.student_budget_templates (name, description, category_allocations, total_budget) VALUES
  (
    'Freshman Essentials',
    'Budget template for first-year college students',
    '{
      "housing": 35,
      "food": 25,
      "textbooks": 15,
      "transportation": 10,
      "entertainment": 10,
      "savings": 5
    }'::jsonb,
    1000
  ),
  (
    'Off-Campus Living',
    'Budget for students living off-campus',
    '{
      "rent": 40,
      "utilities": 10,
      "groceries": 20,
      "transportation": 10,
      "textbooks": 10,
      "entertainment": 5,
      "savings": 5
    }'::jsonb,
    1500
  ),
  (
    'Commuter Student',
    'Budget for students commuting from home',
    '{
      "transportation": 30,
      "food": 25,
      "textbooks": 20,
      "supplies": 10,
      "entertainment": 10,
      "savings": 5
    }'::jsonb,
    600
  )
ON CONFLICT DO NOTHING;

-- Create triggers for updated_at
CREATE TRIGGER update_family_groups_updated_at
  BEFORE UPDATE ON public.family_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_budgets_updated_at
  BEFORE UPDATE ON public.family_budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_allowances_updated_at
  BEFORE UPDATE ON public.allowances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scholarships_updated_at
  BEFORE UPDATE ON public.scholarships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_loans_updated_at
  BEFORE UPDATE ON public.student_loans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();