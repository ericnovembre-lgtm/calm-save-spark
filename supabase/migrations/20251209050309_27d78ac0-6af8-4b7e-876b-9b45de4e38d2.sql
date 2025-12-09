-- Phase 3: Income Tracking & Net Worth Dashboard Tables

-- Create income_entries table
CREATE TABLE public.income_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'salary' CHECK (source_type IN ('salary', 'freelance', 'investment', 'rental', 'business', 'side_hustle', 'pension', 'benefits', 'gift', 'other')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('one_time', 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'annually')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_withheld NUMERIC DEFAULT 0,
  is_taxable BOOLEAN NOT NULL DEFAULT true,
  account_id UUID REFERENCES public.connected_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create net_worth_snapshots table
CREATE TABLE public.net_worth_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_assets NUMERIC NOT NULL DEFAULT 0,
  total_liabilities NUMERIC NOT NULL DEFAULT 0,
  net_worth NUMERIC NOT NULL DEFAULT 0,
  asset_breakdown JSONB DEFAULT '{}'::jsonb,
  liability_breakdown JSONB DEFAULT '{}'::jsonb,
  snapshot_type TEXT NOT NULL DEFAULT 'automatic' CHECK (snapshot_type IN ('automatic', 'manual')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- Create net_worth_milestones table
CREATE TABLE public.net_worth_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('positive_net_worth', 'round_number', 'all_time_high', 'debt_free', 'savings_goal', 'custom')),
  milestone_value NUMERIC NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  previous_value NUMERIC,
  celebration_shown BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_income_entries_user_id ON public.income_entries(user_id);
CREATE INDEX idx_income_entries_active ON public.income_entries(user_id, is_active);
CREATE INDEX idx_net_worth_snapshots_user_id ON public.net_worth_snapshots(user_id);
CREATE INDEX idx_net_worth_snapshots_date ON public.net_worth_snapshots(user_id, snapshot_date DESC);
CREATE INDEX idx_net_worth_milestones_user_id ON public.net_worth_milestones(user_id);

-- Enable Row Level Security
ALTER TABLE public.income_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.net_worth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.net_worth_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for income_entries
CREATE POLICY "Users can view their own income entries"
  ON public.income_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income entries"
  ON public.income_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income entries"
  ON public.income_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income entries"
  ON public.income_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for net_worth_snapshots
CREATE POLICY "Users can view their own net worth snapshots"
  ON public.net_worth_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own net worth snapshots"
  ON public.net_worth_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own net worth snapshots"
  ON public.net_worth_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own net worth snapshots"
  ON public.net_worth_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for net_worth_milestones
CREATE POLICY "Users can view their own milestones"
  ON public.net_worth_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own milestones"
  ON public.net_worth_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
  ON public.net_worth_milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones"
  ON public.net_worth_milestones FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for milestones (for celebration triggers)
ALTER PUBLICATION supabase_realtime ADD TABLE public.net_worth_milestones;

-- Update timestamp triggers
CREATE TRIGGER update_income_entries_updated_at
  BEFORE UPDATE ON public.income_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_net_worth_snapshots_updated_at
  BEFORE UPDATE ON public.net_worth_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_net_worth_milestones_updated_at
  BEFORE UPDATE ON public.net_worth_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();