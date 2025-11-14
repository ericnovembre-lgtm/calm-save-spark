-- Fix RLS infinite recursion by creating SECURITY DEFINER helper functions
-- This breaks circular dependencies in policies

-- ============================================
-- HELPER FUNCTIONS TO BREAK RECURSION
-- ============================================

-- Function to get organization IDs a user belongs to (breaks organizations <-> organization_members recursion)
CREATE OR REPLACE FUNCTION public.user_organization_ids(user_uuid uuid)
RETURNS TABLE(organization_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Get organizations where user is a member
  SELECT om.organization_id 
  FROM organization_members om 
  WHERE om.user_id = user_uuid
  
  UNION
  
  -- Get organizations where user is the owner
  SELECT o.id 
  FROM organizations o 
  WHERE o.owner_id = user_uuid
$$;

-- Function to get family group IDs a user belongs to (breaks family_members self-recursion)
CREATE OR REPLACE FUNCTION public.user_family_group_ids(user_uuid uuid)
RETURNS TABLE(family_group_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT fm.family_group_id 
  FROM family_members fm 
  WHERE fm.user_id = user_uuid
$$;

-- Function to check if user is owner or admin of organization (breaks complex multi-table recursion)
CREATE OR REPLACE FUNCTION public.user_is_org_owner_or_admin(user_uuid uuid, org_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Check if user is owner
    SELECT 1 FROM organizations WHERE id = org_uuid AND owner_id = user_uuid
    
    UNION
    
    -- Check if user is admin member
    SELECT 1 FROM organization_members 
    WHERE organization_id = org_uuid 
      AND user_id = user_uuid 
      AND role IN ('owner', 'admin')
  )
$$;

-- Add comments documenting the security model
COMMENT ON FUNCTION public.user_organization_ids(uuid) IS 
'SECURITY DEFINER function to get organization IDs a user belongs to. Breaks RLS recursion between organizations and organization_members tables.';

COMMENT ON FUNCTION public.user_family_group_ids(uuid) IS 
'SECURITY DEFINER function to get family group IDs a user belongs to. Breaks RLS self-recursion in family_members table.';

COMMENT ON FUNCTION public.user_is_org_owner_or_admin(uuid, uuid) IS 
'SECURITY DEFINER function to check if user is owner or admin of an organization. Breaks complex multi-table RLS recursion.';

-- ============================================
-- FIX ORGANIZATIONS POLICIES
-- ============================================

-- Drop and recreate organizations policies to use helper function
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
CREATE POLICY "Users can view organizations they belong to"
  ON public.organizations FOR SELECT
  USING (
    id IN (SELECT organization_id FROM user_organization_ids(auth.uid()))
  );

-- ============================================
-- FIX ORGANIZATION_MEMBERS POLICIES
-- ============================================

-- Drop and recreate organization_members policies to use helper functions
DROP POLICY IF EXISTS "Members can view organization members" ON public.organization_members;
CREATE POLICY "Members can view organization members"
  ON public.organization_members FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM user_organization_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Owners and admins can manage members" ON public.organization_members;
CREATE POLICY "Owners and admins can manage members"
  ON public.organization_members FOR ALL
  USING (
    user_is_org_owner_or_admin(auth.uid(), organization_id)
  );

-- ============================================
-- FIX ORGANIZATION_BRANDING POLICIES
-- ============================================

-- Drop and recreate organization_branding policies to use helper functions
DROP POLICY IF EXISTS "Users can view branding for their organizations" ON public.organization_branding;
CREATE POLICY "Users can view branding for their organizations"
  ON public.organization_branding FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM user_organization_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Owners and admins can manage branding" ON public.organization_branding;
CREATE POLICY "Owners and admins can manage branding"
  ON public.organization_branding FOR ALL
  USING (
    user_is_org_owner_or_admin(auth.uid(), organization_id)
  );

-- ============================================
-- FIX FAMILY_MEMBERS POLICIES
-- ============================================

-- Drop and recreate family_members policies to use helper function
DROP POLICY IF EXISTS "Members can view family members" ON public.family_members;
CREATE POLICY "Members can view family members"
  ON public.family_members FOR SELECT
  USING (
    family_group_id IN (SELECT family_group_id FROM user_family_group_ids(auth.uid()))
  );

-- Also fix other family-related policies that might reference family_members
DROP POLICY IF EXISTS "Family members can view family budgets" ON public.family_budgets;
CREATE POLICY "Family members can view family budgets"
  ON public.family_budgets FOR SELECT
  USING (
    family_group_id IN (SELECT family_group_id FROM user_family_group_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Family members can view allowances" ON public.allowances;
CREATE POLICY "Family members can view allowances"
  ON public.allowances FOR SELECT
  USING (
    family_group_id IN (SELECT family_group_id FROM user_family_group_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Family members can view family expenses" ON public.family_expenses;
CREATE POLICY "Family members can view family expenses"
  ON public.family_expenses FOR SELECT
  USING (
    family_group_id IN (SELECT family_group_id FROM user_family_group_ids(auth.uid()))
  );

DROP POLICY IF EXISTS "Family members can add expenses" ON public.family_expenses;
CREATE POLICY "Family members can add expenses"
  ON public.family_expenses FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    family_group_id IN (SELECT family_group_id FROM user_family_group_ids(auth.uid()))
  );