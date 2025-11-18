-- Create budget_shares table for multi-user access
CREATE TABLE IF NOT EXISTS public.budget_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES public.user_budgets(id) ON DELETE CASCADE,
  shared_with_user_id uuid NOT NULL,
  permission_level text NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
  invited_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  UNIQUE(budget_id, shared_with_user_id)
);

-- Create budget_activity_log table
CREATE TABLE IF NOT EXISTS public.budget_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES public.user_budgets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  action_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create budget_comments table
CREATE TABLE IF NOT EXISTS public.budget_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES public.user_budgets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  comment_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_edited boolean DEFAULT false,
  parent_comment_id uuid REFERENCES public.budget_comments(id) ON DELETE CASCADE
);

-- Create shared_category_templates table
CREATE TABLE IF NOT EXISTS public.shared_category_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  template_type text NOT NULL DEFAULT 'household' CHECK (template_type IN ('household', 'couple', 'family', 'roommates', 'custom')),
  categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budget_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_category_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_shares
CREATE POLICY "Budget owners can share their budgets"
ON public.budget_shares
FOR INSERT
TO authenticated
WITH CHECK (
  invited_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.user_budgets
    WHERE id = budget_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view shares where they are involved"
ON public.budget_shares
FOR SELECT
TO authenticated
USING (
  shared_with_user_id = auth.uid() OR
  invited_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_budgets
    WHERE id = budget_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Budget owners and admins can manage shares"
ON public.budget_shares
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_budgets
    WHERE id = budget_id AND user_id = auth.uid()
  ) OR
  (shared_with_user_id = auth.uid() AND permission_level = 'admin')
);

CREATE POLICY "Budget owners and admins can delete shares"
ON public.budget_shares
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_budgets
    WHERE id = budget_id AND user_id = auth.uid()
  ) OR
  (shared_with_user_id = auth.uid() AND permission_level = 'admin')
);

-- RLS Policies for budget_activity_log
CREATE POLICY "Collaborators can insert activity logs"
ON public.budget_activity_log
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  (
    EXISTS (
      SELECT 1 FROM public.user_budgets
      WHERE id = budget_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.budget_shares
      WHERE budget_id = budget_activity_log.budget_id
      AND shared_with_user_id = auth.uid()
      AND status = 'accepted'
    )
  )
);

CREATE POLICY "Collaborators can view activity logs"
ON public.budget_activity_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_budgets
    WHERE id = budget_id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.budget_shares
    WHERE budget_id = budget_activity_log.budget_id
    AND shared_with_user_id = auth.uid()
    AND status = 'accepted'
  )
);

-- RLS Policies for budget_comments
CREATE POLICY "Collaborators can add comments"
ON public.budget_comments
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  (
    EXISTS (
      SELECT 1 FROM public.user_budgets
      WHERE id = budget_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.budget_shares
      WHERE budget_id = budget_comments.budget_id
      AND shared_with_user_id = auth.uid()
      AND status = 'accepted'
    )
  )
);

CREATE POLICY "Collaborators can view comments"
ON public.budget_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_budgets
    WHERE id = budget_id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.budget_shares
    WHERE budget_id = budget_comments.budget_id
    AND shared_with_user_id = auth.uid()
    AND status = 'accepted'
  )
);

CREATE POLICY "Users can update their own comments"
ON public.budget_comments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
ON public.budget_comments
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for shared_category_templates
CREATE POLICY "Users can create templates"
ON public.shared_category_templates
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view public templates and their own"
ON public.shared_category_templates
FOR SELECT
TO authenticated
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can update their own templates"
ON public.shared_category_templates
FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates"
ON public.shared_category_templates
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_budget_shares_budget_id ON public.budget_shares(budget_id);
CREATE INDEX idx_budget_shares_user_id ON public.budget_shares(shared_with_user_id);
CREATE INDEX idx_budget_activity_budget_id ON public.budget_activity_log(budget_id);
CREATE INDEX idx_budget_activity_created_at ON public.budget_activity_log(created_at DESC);
CREATE INDEX idx_budget_comments_budget_id ON public.budget_comments(budget_id);
CREATE INDEX idx_budget_comments_created_at ON public.budget_comments(created_at DESC);

-- Create function to log budget activity
CREATE OR REPLACE FUNCTION log_budget_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.budget_activity_log (budget_id, user_id, action_type, action_data)
  VALUES (
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    TG_OP,
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$;

-- Create trigger for user_budgets activity logging
DROP TRIGGER IF EXISTS log_user_budgets_activity ON public.user_budgets;
CREATE TRIGGER log_user_budgets_activity
AFTER INSERT OR UPDATE OR DELETE ON public.user_budgets
FOR EACH ROW
EXECUTE FUNCTION log_budget_activity();

-- Enable realtime for collaboration features
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_comments;

-- Update user_budgets RLS to include shared access
DROP POLICY IF EXISTS "Users can view own budgets" ON public.user_budgets;
CREATE POLICY "Users can view own and shared budgets"
ON public.user_budgets
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.budget_shares
    WHERE budget_id = user_budgets.id
    AND shared_with_user_id = auth.uid()
    AND status = 'accepted'
  )
);

DROP POLICY IF EXISTS "Users can update own budgets" ON public.user_budgets;
CREATE POLICY "Users can update own and editable shared budgets"
ON public.user_budgets
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.budget_shares
    WHERE budget_id = user_budgets.id
    AND shared_with_user_id = auth.uid()
    AND status = 'accepted'
    AND permission_level IN ('edit', 'admin')
  )
);