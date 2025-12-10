-- Phase 5: Create tables for Financial Milestones Timeline, Money Mindset, Community Forum, Financial Goals Sharing, and Widget Builder

-- 1. Money Mindset Entries table
CREATE TABLE public.money_mindset_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('reflection', 'belief', 'goal_statement', 'affirmation')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  tags TEXT[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Forum Categories table
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Forum Posts table
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.forum_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Forum Comments table
CREATE TABLE public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Forum Post Likes table
CREATE TABLE public.forum_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_post_like UNIQUE (post_id, user_id),
  CONSTRAINT unique_comment_like UNIQUE (comment_id, user_id),
  CONSTRAINT check_one_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- 6. Widget Builder Templates table
CREATE TABLE public.widget_builder_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  widget_config JSONB NOT NULL DEFAULT '{}',
  preview_image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.money_mindset_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_builder_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for money_mindset_entries
CREATE POLICY "Users can view own mindset entries"
  ON public.money_mindset_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own mindset entries"
  ON public.money_mindset_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mindset entries"
  ON public.money_mindset_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mindset entries"
  ON public.money_mindset_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for forum_categories (public read)
CREATE POLICY "Anyone can view active forum categories"
  ON public.forum_categories FOR SELECT
  USING (is_active = true);

-- RLS Policies for forum_posts
CREATE POLICY "Anyone can view forum posts"
  ON public.forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.forum_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.forum_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.forum_posts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for forum_comments
CREATE POLICY "Anyone can view forum comments"
  ON public.forum_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.forum_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.forum_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.forum_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for forum_post_likes
CREATE POLICY "Anyone can view likes"
  ON public.forum_post_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create likes"
  ON public.forum_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON public.forum_post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for widget_builder_templates
CREATE POLICY "Users can view own or public templates"
  ON public.widget_builder_templates FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own templates"
  ON public.widget_builder_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON public.widget_builder_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON public.widget_builder_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for forum tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_comments;

-- Insert default forum categories
INSERT INTO public.forum_categories (name, slug, description, icon, display_order) VALUES
  ('General Discussion', 'general', 'General financial discussions and questions', 'MessageCircle', 1),
  ('Budgeting Tips', 'budgeting', 'Share and learn budgeting strategies', 'Calculator', 2),
  ('Saving Strategies', 'saving', 'Discuss saving goals and techniques', 'PiggyBank', 3),
  ('Debt Management', 'debt', 'Help and advice for managing debt', 'CreditCard', 4),
  ('Investing', 'investing', 'Investment discussions and advice', 'TrendingUp', 5),
  ('Success Stories', 'success', 'Share your financial wins', 'Trophy', 6);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_money_mindset_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_money_mindset_entries_updated_at
  BEFORE UPDATE ON public.money_mindset_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_money_mindset_updated_at();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_money_mindset_updated_at();

CREATE TRIGGER update_forum_comments_updated_at
  BEFORE UPDATE ON public.forum_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_money_mindset_updated_at();

CREATE TRIGGER update_widget_builder_templates_updated_at
  BEFORE UPDATE ON public.widget_builder_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_money_mindset_updated_at();