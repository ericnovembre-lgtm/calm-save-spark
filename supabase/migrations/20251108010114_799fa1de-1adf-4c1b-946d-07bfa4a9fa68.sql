-- ============================================
-- PHASE 5A: WHITE-LABEL SOLUTIONS
-- ============================================

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'basic', -- basic, professional, enterprise
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create organization branding table
CREATE TABLE public.organization_branding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#ffffff',
  accent_color TEXT DEFAULT '#007bff',
  custom_domain TEXT,
  favicon_url TEXT,
  custom_css TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id)
);

-- Create organization API keys table
CREATE TABLE public.organization_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '{"read": true, "write": false}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create organization members table
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member
  permissions JSONB DEFAULT '{}'::jsonb,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- ============================================
-- PHASE 5B: FINANCIAL LITERACY PLATFORM
-- ============================================

-- Create literacy courses table
CREATE TABLE public.literacy_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner', -- beginner, intermediate, advanced
  category TEXT NOT NULL, -- budgeting, investing, debt_management, retirement, etc.
  duration_minutes INTEGER,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course modules table
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.literacy_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  module_order INTEGER NOT NULL,
  quiz_questions JSONB, -- Array of quiz questions
  video_url TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user course progress table
CREATE TABLE public.user_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.literacy_courses(id) ON DELETE CASCADE,
  completed_modules JSONB DEFAULT '[]'::jsonb, -- Array of module IDs
  quiz_scores JSONB DEFAULT '{}'::jsonb, -- Map of module_id to score
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create course certificates table
CREATE TABLE public.course_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.literacy_courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  certificate_url TEXT,
  UNIQUE(user_id, course_id)
);

-- ============================================
-- PHASE 5C: SUSTAINABLE FINANCE
-- ============================================

-- Create ESG preferences table
CREATE TABLE public.esg_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  environmental_weight INTEGER DEFAULT 33, -- 0-100
  social_weight INTEGER DEFAULT 33,
  governance_weight INTEGER DEFAULT 34,
  exclude_sectors TEXT[], -- Array of sectors to exclude
  carbon_offset_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create carbon footprint logs table
CREATE TABLE public.carbon_footprint_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  carbon_kg NUMERIC NOT NULL, -- Carbon emissions in kg
  category TEXT NOT NULL, -- transport, food, utilities, retail, etc.
  merchant TEXT,
  log_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sustainable goals table
CREATE TABLE public.sustainable_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  goal_type TEXT NOT NULL, -- carbon_reduction, esg_investment, green_spending
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  target_date TIMESTAMP WITH TIME ZONE,
  impact_metrics JSONB, -- e.g., trees planted, carbon offset
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ESG investments table
CREATE TABLE public.esg_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_name TEXT NOT NULL,
  ticker_symbol TEXT,
  amount NUMERIC NOT NULL,
  esg_score NUMERIC, -- 0-100
  environmental_score NUMERIC,
  social_score NUMERIC,
  governance_score NUMERIC,
  sectors TEXT[],
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.literacy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_footprint_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainable_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_investments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - WHITE-LABEL
-- ============================================

-- Organizations
CREATE POLICY "Users can view organizations they belong to"
  ON public.organizations FOR SELECT
  USING (
    auth.uid() = owner_id OR
    id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their organizations"
  ON public.organizations FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their organizations"
  ON public.organizations FOR DELETE
  USING (auth.uid() = owner_id);

-- Organization Branding
CREATE POLICY "Users can view branding for their organizations"
  ON public.organization_branding FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can manage branding"
  ON public.organization_branding FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Organization API Keys
CREATE POLICY "Owners can manage API keys"
  ON public.organization_api_keys FOR ALL
  USING (
    organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid())
  );

-- Organization Members
CREATE POLICY "Members can view organization members"
  ON public.organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can manage members"
  ON public.organization_members FOR ALL
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- RLS POLICIES - FINANCIAL LITERACY
-- ============================================

-- Literacy Courses (public read for published courses)
CREATE POLICY "Anyone can view published courses"
  ON public.literacy_courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage courses"
  ON public.literacy_courses FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Course Modules
CREATE POLICY "Anyone can view modules of published courses"
  ON public.course_modules FOR SELECT
  USING (
    course_id IN (SELECT id FROM public.literacy_courses WHERE is_published = true)
  );

CREATE POLICY "Admins can manage modules"
  ON public.course_modules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- User Course Progress
CREATE POLICY "Users can view own progress"
  ON public.user_course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_course_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Course Certificates
CREATE POLICY "Users can view own certificates"
  ON public.course_certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can issue certificates"
  ON public.course_certificates FOR INSERT
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES - SUSTAINABLE FINANCE
-- ============================================

-- ESG Preferences
CREATE POLICY "Users can view own ESG preferences"
  ON public.esg_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ESG preferences"
  ON public.esg_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ESG preferences"
  ON public.esg_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Carbon Footprint Logs
CREATE POLICY "Users can view own carbon logs"
  ON public.carbon_footprint_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own carbon logs"
  ON public.carbon_footprint_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sustainable Goals
CREATE POLICY "Users can manage own sustainable goals"
  ON public.sustainable_goals FOR ALL
  USING (auth.uid() = user_id);

-- ESG Investments
CREATE POLICY "Users can manage own ESG investments"
  ON public.esg_investments FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_organizations_owner ON public.organizations(owner_id);
CREATE INDEX idx_organization_members_user ON public.organization_members(user_id);
CREATE INDEX idx_organization_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_course_modules_course ON public.course_modules(course_id);
CREATE INDEX idx_user_course_progress_user ON public.user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_course ON public.user_course_progress(course_id);
CREATE INDEX idx_carbon_logs_user ON public.carbon_footprint_logs(user_id);
CREATE INDEX idx_carbon_logs_date ON public.carbon_footprint_logs(log_date);
CREATE INDEX idx_sustainable_goals_user ON public.sustainable_goals(user_id);
CREATE INDEX idx_esg_investments_user ON public.esg_investments(user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_branding_updated_at
  BEFORE UPDATE ON public.organization_branding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_literacy_courses_updated_at
  BEFORE UPDATE ON public.literacy_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_course_progress_updated_at
  BEFORE UPDATE ON public.user_course_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_esg_preferences_updated_at
  BEFORE UPDATE ON public.esg_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sustainable_goals_updated_at
  BEFORE UPDATE ON public.sustainable_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_esg_investments_updated_at
  BEFORE UPDATE ON public.esg_investments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();