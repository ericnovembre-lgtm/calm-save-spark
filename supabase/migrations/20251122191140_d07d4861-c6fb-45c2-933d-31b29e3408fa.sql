-- Create market data cache table for real-time price updates
CREATE TABLE IF NOT EXISTS public.market_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL,
  change_percent NUMERIC,
  volume BIGINT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create benchmark data table (S&P 500, etc.)
CREATE TABLE IF NOT EXISTS public.benchmark_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_name TEXT NOT NULL,
  date DATE NOT NULL,
  value NUMERIC NOT NULL,
  change_percent NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(benchmark_name, date)
);

-- Create portfolio snapshots table for performance tracking
CREATE TABLE IF NOT EXISTS public.portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_value NUMERIC NOT NULL,
  snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create rebalancing suggestions table
CREATE TABLE IF NOT EXISTS public.rebalancing_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  suggestion_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rebalancing_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Market data is public (read-only)
CREATE POLICY "Market data is viewable by everyone" 
  ON public.market_data_cache FOR SELECT 
  USING (true);

-- Benchmark data is public (read-only)
CREATE POLICY "Benchmark data is viewable by everyone" 
  ON public.benchmark_data FOR SELECT 
  USING (true);

-- Portfolio snapshots are user-specific
CREATE POLICY "Users can view own portfolio snapshots" 
  ON public.portfolio_snapshots FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio snapshots" 
  ON public.portfolio_snapshots FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Rebalancing suggestions are user-specific
CREATE POLICY "Users can view own rebalancing suggestions" 
  ON public.rebalancing_suggestions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rebalancing suggestions" 
  ON public.rebalancing_suggestions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rebalancing suggestions" 
  ON public.rebalancing_suggestions FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_date ON public.portfolio_snapshots(user_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON public.market_data_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_benchmark_data_name_date ON public.benchmark_data(benchmark_name, date DESC);

-- Function to update market data timestamp
CREATE OR REPLACE FUNCTION update_market_data_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for market data updates
DROP TRIGGER IF EXISTS update_market_data_timestamp_trigger ON public.market_data_cache;
CREATE TRIGGER update_market_data_timestamp_trigger
  BEFORE UPDATE ON public.market_data_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_market_data_timestamp();