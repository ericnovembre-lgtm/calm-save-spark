
-- =====================================================
-- Phase 13: Advanced Intelligence & Integrations
-- =====================================================

-- 1. Category Feedback Table (ML Learning System)
CREATE TABLE IF NOT EXISTS public.category_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  suggestion_id UUID,
  merchant_name TEXT NOT NULL,
  suggested_category TEXT NOT NULL,
  accepted_category TEXT,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('accepted', 'corrected', 'rejected')),
  confidence_before NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for ML training queries
CREATE INDEX IF NOT EXISTS idx_category_feedback_merchant ON public.category_feedback(merchant_name, feedback_type);
CREATE INDEX IF NOT EXISTS idx_category_feedback_user ON public.category_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_category_feedback_category ON public.category_feedback(suggested_category, accepted_category);

-- Enable RLS
ALTER TABLE public.category_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for category_feedback
CREATE POLICY "Users can view own feedback"
  ON public.category_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON public.category_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback"
  ON public.category_feedback FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Template Marketplace Table
CREATE TABLE IF NOT EXISTS public.template_marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.shared_category_templates(id) ON DELETE CASCADE,
  author_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  downloads_count INTEGER DEFAULT 0,
  rating_average NUMERIC DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  author_name TEXT,
  income_level TEXT,
  household_type TEXT,
  published_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for marketplace queries
CREATE INDEX IF NOT EXISTS idx_template_marketplace_tags ON public.template_marketplace USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_template_marketplace_featured ON public.template_marketplace(featured, rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_template_marketplace_downloads ON public.template_marketplace(downloads_count DESC);

-- Enable RLS
ALTER TABLE public.template_marketplace ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_marketplace (public read, author write)
CREATE POLICY "Anyone can view marketplace templates"
  ON public.template_marketplace FOR SELECT
  USING (true);

CREATE POLICY "Authors can insert own templates"
  ON public.template_marketplace FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own templates"
  ON public.template_marketplace FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own templates"
  ON public.template_marketplace FOR DELETE
  USING (auth.uid() = author_id);

-- 3. Template Ratings Table
CREATE TABLE IF NOT EXISTS public.template_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_id UUID REFERENCES public.template_marketplace(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(marketplace_id, user_id)
);

-- Enable RLS
ALTER TABLE public.template_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_ratings
CREATE POLICY "Anyone can view ratings"
  ON public.template_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own ratings"
  ON public.template_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON public.template_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON public.template_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Add currency fields to transactions if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'original_amount') THEN
    ALTER TABLE public.transactions ADD COLUMN original_amount NUMERIC;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'original_currency') THEN
    ALTER TABLE public.transactions ADD COLUMN original_currency TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'exchange_rate_used') THEN
    ALTER TABLE public.transactions ADD COLUMN exchange_rate_used NUMERIC;
  END IF;
END $$;

-- 5. Add currency to user_budgets if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_budgets' AND column_name = 'currency') THEN
    ALTER TABLE public.user_budgets ADD COLUMN currency TEXT DEFAULT 'USD';
  END IF;
END $$;

-- 6. Function to update template rating average
CREATE OR REPLACE FUNCTION public.update_template_rating_average()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.template_marketplace
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.template_ratings
      WHERE marketplace_id = COALESCE(NEW.marketplace_id, OLD.marketplace_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.template_ratings
      WHERE marketplace_id = COALESCE(NEW.marketplace_id, OLD.marketplace_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.marketplace_id, OLD.marketplace_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 7. Trigger to update rating average
DROP TRIGGER IF EXISTS update_template_rating_trigger ON public.template_ratings;
CREATE TRIGGER update_template_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.template_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_template_rating_average();

-- 8. Function to increment download count
CREATE OR REPLACE FUNCTION public.increment_template_downloads(template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.template_marketplace
  SET downloads_count = downloads_count + 1
  WHERE id = template_id;
END;
$$;
