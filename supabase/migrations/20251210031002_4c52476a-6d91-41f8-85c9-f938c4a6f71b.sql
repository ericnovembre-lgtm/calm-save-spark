
-- Phase 3: Smart Categories, Financial Calendar, Import/Export Center

-- =============================================
-- SMART CATEGORIES TABLES
-- =============================================

-- Smart category rules for user-defined categorization
CREATE TABLE public.smart_category_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  merchant_pattern TEXT NOT NULL,
  assigned_category TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  match_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Merchant mappings for custom merchant-to-category assignments
CREATE TABLE public.merchant_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  merchant_name TEXT NOT NULL,
  display_name TEXT,
  category TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, merchant_name)
);

-- =============================================
-- FINANCIAL CALENDAR TABLES
-- =============================================

-- Financial events (unified calendar events)
CREATE TABLE public.financial_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2),
  event_date DATE NOT NULL,
  recurrence_rule TEXT,
  source_id UUID,
  source_type TEXT,
  color TEXT DEFAULT '#f59e0b',
  is_completed BOOLEAN DEFAULT false,
  reminder_days INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Financial reminders
CREATE TABLE public.financial_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID REFERENCES public.financial_events(id) ON DELETE CASCADE,
  reminder_date TIMESTAMPTZ NOT NULL,
  reminder_type TEXT DEFAULT 'notification',
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- IMPORT/EXPORT CENTER TABLES
-- =============================================

-- Import jobs
CREATE TABLE public.import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  file_name TEXT,
  file_size INTEGER,
  total_rows INTEGER,
  processed_rows INTEGER DEFAULT 0,
  successful_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  mapping_config JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Export jobs
CREATE TABLE public.export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  export_type TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  date_range_start DATE,
  date_range_end DATE,
  filters JSONB,
  file_url TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.smart_category_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - Smart Category Rules
-- =============================================

CREATE POLICY "Users can view their own category rules"
  ON public.smart_category_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own category rules"
  ON public.smart_category_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category rules"
  ON public.smart_category_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own category rules"
  ON public.smart_category_rules FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Merchant Mappings
-- =============================================

CREATE POLICY "Users can view their own merchant mappings"
  ON public.merchant_mappings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own merchant mappings"
  ON public.merchant_mappings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own merchant mappings"
  ON public.merchant_mappings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own merchant mappings"
  ON public.merchant_mappings FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Financial Events
-- =============================================

CREATE POLICY "Users can view their own financial events"
  ON public.financial_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own financial events"
  ON public.financial_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial events"
  ON public.financial_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial events"
  ON public.financial_events FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Financial Reminders
-- =============================================

CREATE POLICY "Users can view their own financial reminders"
  ON public.financial_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own financial reminders"
  ON public.financial_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial reminders"
  ON public.financial_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial reminders"
  ON public.financial_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Import Jobs
-- =============================================

CREATE POLICY "Users can view their own import jobs"
  ON public.import_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own import jobs"
  ON public.import_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import jobs"
  ON public.import_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own import jobs"
  ON public.import_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - Export Jobs
-- =============================================

CREATE POLICY "Users can view their own export jobs"
  ON public.export_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export jobs"
  ON public.export_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own export jobs"
  ON public.export_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own export jobs"
  ON public.export_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- ENABLE REALTIME
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.import_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.export_jobs;

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================

CREATE TRIGGER update_smart_category_rules_updated_at
  BEFORE UPDATE ON public.smart_category_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_events_updated_at
  BEFORE UPDATE ON public.financial_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_smart_category_rules_user ON public.smart_category_rules(user_id);
CREATE INDEX idx_merchant_mappings_user ON public.merchant_mappings(user_id);
CREATE INDEX idx_financial_events_user_date ON public.financial_events(user_id, event_date);
CREATE INDEX idx_financial_reminders_user ON public.financial_reminders(user_id);
CREATE INDEX idx_import_jobs_user ON public.import_jobs(user_id);
CREATE INDEX idx_export_jobs_user ON public.export_jobs(user_id);
