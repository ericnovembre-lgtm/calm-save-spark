-- Create portfolio_holdings table for Investment Manager
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  cost_basis NUMERIC NOT NULL DEFAULT 0,
  market_value NUMERIC NOT NULL DEFAULT 0,
  unrealized_gain_loss NUMERIC NOT NULL DEFAULT 0,
  asset_type TEXT NOT NULL DEFAULT 'stock',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax_loss_harvest_opportunities table
CREATE TABLE IF NOT EXISTS public.tax_loss_harvest_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  holding_id UUID REFERENCES public.portfolio_holdings(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  current_loss NUMERIC NOT NULL,
  potential_tax_savings NUMERIC NOT NULL,
  replacement_symbol TEXT,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to refinancing_opportunities
ALTER TABLE public.refinancing_opportunities 
  ADD COLUMN IF NOT EXISTS loan_type TEXT DEFAULT 'mortgage',
  ADD COLUMN IF NOT EXISTS available_rate NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS net_savings NUMERIC DEFAULT 0;

-- Enable RLS
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_loss_harvest_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_holdings
CREATE POLICY "Users can view own holdings" ON public.portfolio_holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own holdings" ON public.portfolio_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own holdings" ON public.portfolio_holdings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own holdings" ON public.portfolio_holdings FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tax_loss_harvest_opportunities
CREATE POLICY "Users can view own TLH opportunities" ON public.tax_loss_harvest_opportunities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own TLH opportunities" ON public.tax_loss_harvest_opportunities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own TLH opportunities" ON public.tax_loss_harvest_opportunities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own TLH opportunities" ON public.tax_loss_harvest_opportunities FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_portfolio_holdings_user_id ON public.portfolio_holdings(user_id);
CREATE INDEX idx_portfolio_holdings_symbol ON public.portfolio_holdings(symbol);
CREATE INDEX idx_tlh_opportunities_user_id ON public.tax_loss_harvest_opportunities(user_id);
CREATE INDEX idx_tlh_opportunities_status ON public.tax_loss_harvest_opportunities(status);

-- Trigger for updated_at
CREATE TRIGGER update_tlh_opportunities_updated_at BEFORE UPDATE ON public.tax_loss_harvest_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();