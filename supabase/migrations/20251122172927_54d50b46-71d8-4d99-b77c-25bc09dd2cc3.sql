-- Transaction Insights Table
-- Stores AI-generated insights about spending patterns
CREATE TABLE IF NOT EXISTS public.transaction_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'acted_on')),
  acted_on_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_insights_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for transaction insights
CREATE INDEX IF NOT EXISTS idx_transaction_insights_user_status 
  ON public.transaction_insights(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transaction_insights_type 
  ON public.transaction_insights(insight_type, user_id);

-- Transaction Tags Table
-- Allows users to add custom tags to transactions
CREATE TABLE IF NOT EXISTS public.transaction_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tag_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_tags_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_tag UNIQUE(user_id, tag_name)
);

-- Transaction Tags Junction Table
CREATE TABLE IF NOT EXISTS public.transaction_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID NOT NULL,
  CONSTRAINT fk_tag_assignment_transaction FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE,
  CONSTRAINT fk_tag_assignment_tag FOREIGN KEY (tag_id) REFERENCES public.transaction_tags(id) ON DELETE CASCADE,
  CONSTRAINT fk_tag_assignment_user FOREIGN KEY (assigned_by) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_transaction_tag UNIQUE(transaction_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_transaction_tag_assignments_transaction 
  ON public.transaction_tag_assignments(transaction_id);

CREATE INDEX IF NOT EXISTS idx_transaction_tag_assignments_tag 
  ON public.transaction_tag_assignments(tag_id);

-- Spending Patterns Table
-- Tracks recurring spending patterns detected by AI
CREATE TABLE IF NOT EXISTS public.spending_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('recurring', 'seasonal', 'unusual', 'trend')),
  merchant TEXT,
  category TEXT,
  frequency TEXT,
  average_amount DECIMAL(10, 2),
  confidence_score DECIMAL(3, 2) DEFAULT 0.0,
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_occurrence_at TIMESTAMPTZ,
  occurrence_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_patterns_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_spending_patterns_user_active 
  ON public.spending_patterns(user_id, is_active, pattern_type);

-- Merchant Category Mapping Table
-- Stores AI-learned merchant to category mappings
CREATE TABLE IF NOT EXISTS public.merchant_category_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  merchant_name TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence_score DECIMAL(3, 2) DEFAULT 0.0,
  times_applied INTEGER DEFAULT 1,
  is_user_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_merchant_category UNIQUE(user_id, merchant_name)
);

CREATE INDEX IF NOT EXISTS idx_merchant_category_mappings_merchant 
  ON public.merchant_category_mappings(merchant_name);

CREATE INDEX IF NOT EXISTS idx_merchant_category_mappings_user 
  ON public.merchant_category_mappings(user_id, is_user_confirmed);

-- Smart Alerts Table
-- Stores AI-generated alerts about spending anomalies
CREATE TABLE IF NOT EXISTS public.smart_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('budget_risk', 'unusual_spending', 'duplicate_charge', 'subscription_increase', 'savings_opportunity')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  action_taken BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  CONSTRAINT fk_alerts_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_smart_alerts_user_unread 
  ON public.smart_alerts(user_id, is_read, is_dismissed, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_smart_alerts_expires 
  ON public.smart_alerts(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS on all tables
ALTER TABLE public.transaction_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transaction_insights
CREATE POLICY "Users can view their own insights"
  ON public.transaction_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON public.transaction_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert insights"
  ON public.transaction_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transaction_tags
CREATE POLICY "Users can view their own tags"
  ON public.transaction_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags"
  ON public.transaction_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
  ON public.transaction_tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON public.transaction_tags FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for transaction_tag_assignments
CREATE POLICY "Users can view tag assignments on their transactions"
  ON public.transaction_tag_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM transactions 
    WHERE transactions.id = transaction_tag_assignments.transaction_id 
    AND transactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can assign tags to their transactions"
  ON public.transaction_tag_assignments FOR INSERT
  WITH CHECK (
    auth.uid() = assigned_by AND
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE transactions.id = transaction_tag_assignments.transaction_id 
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tag assignments from their transactions"
  ON public.transaction_tag_assignments FOR DELETE
  USING (
    auth.uid() = assigned_by OR
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE transactions.id = transaction_tag_assignments.transaction_id 
      AND transactions.user_id = auth.uid()
    )
  );

-- RLS Policies for spending_patterns
CREATE POLICY "Users can view their own spending patterns"
  ON public.spending_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage spending patterns"
  ON public.spending_patterns FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for merchant_category_mappings
CREATE POLICY "Users can view merchant category mappings"
  ON public.merchant_category_mappings FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create their own mappings"
  ON public.merchant_category_mappings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mappings"
  ON public.merchant_category_mappings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for smart_alerts
CREATE POLICY "Users can view their own alerts"
  ON public.smart_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON public.smart_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert alerts"
  ON public.smart_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE public.transaction_insights IS 'AI-generated insights about spending patterns and financial behavior';
COMMENT ON TABLE public.transaction_tags IS 'User-defined tags for organizing transactions';
COMMENT ON TABLE public.transaction_tag_assignments IS 'Junction table linking transactions to tags';
COMMENT ON TABLE public.spending_patterns IS 'Detected recurring spending patterns and trends';
COMMENT ON TABLE public.merchant_category_mappings IS 'AI-learned merchant to category mappings';
COMMENT ON TABLE public.smart_alerts IS 'AI-generated alerts about spending anomalies and opportunities';