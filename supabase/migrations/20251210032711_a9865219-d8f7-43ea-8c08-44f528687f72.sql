-- Phase 4: Financial Diary and AI Insights Archive tables

-- Financial Diary Entries table
CREATE TABLE public.financial_diary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'stressed', 'anxious')),
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
  financial_event_type TEXT,
  amount_involved NUMERIC,
  tags TEXT[],
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Insights Archive table
CREATE TABLE public.ai_insights_archive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_agent TEXT,
  confidence_score NUMERIC,
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  action_taken BOOLEAN DEFAULT false,
  action_taken_at TIMESTAMP WITH TIME ZONE,
  action_result TEXT,
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  related_entity_type TEXT,
  related_entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.financial_diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights_archive ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_diary_entries
CREATE POLICY "Users can view their own diary entries" 
  ON public.financial_diary_entries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diary entries" 
  ON public.financial_diary_entries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diary entries" 
  ON public.financial_diary_entries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diary entries" 
  ON public.financial_diary_entries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for ai_insights_archive
CREATE POLICY "Users can view their own insights" 
  ON public.ai_insights_archive 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights" 
  ON public.ai_insights_archive 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights" 
  ON public.ai_insights_archive 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights" 
  ON public.ai_insights_archive 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_diary_entries_user_date ON public.financial_diary_entries(user_id, entry_date DESC);
CREATE INDEX idx_diary_entries_mood ON public.financial_diary_entries(user_id, mood);
CREATE INDEX idx_insights_archive_user ON public.ai_insights_archive(user_id, created_at DESC);
CREATE INDEX idx_insights_archive_type ON public.ai_insights_archive(user_id, insight_type);
CREATE INDEX idx_insights_archive_dismissed ON public.ai_insights_archive(user_id, dismissed);

-- Trigger for updated_at
CREATE TRIGGER update_diary_entries_updated_at
  BEFORE UPDATE ON public.financial_diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_diary_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_insights_archive;