-- Create market_loan_rates table for refinancing
CREATE TABLE IF NOT EXISTS public.market_loan_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_type TEXT NOT NULL,
  rate_type TEXT NOT NULL DEFAULT 'fixed',
  current_rate NUMERIC NOT NULL,
  previous_rate NUMERIC,
  rate_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  term_years INTEGER,
  min_credit_score INTEGER,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing columns to life_event_playbooks
ALTER TABLE public.life_event_playbooks 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to lifesim_game_sessions
ALTER TABLE public.lifesim_game_sessions
ADD COLUMN IF NOT EXISTS session_name TEXT,
ADD COLUMN IF NOT EXISTS starting_age INTEGER DEFAULT 22,
ADD COLUMN IF NOT EXISTS target_age INTEGER DEFAULT 65;

-- Update existing sessions with default names
UPDATE public.lifesim_game_sessions 
SET session_name = 'Financial Life Simulation'
WHERE session_name IS NULL;

-- Enable RLS on market_loan_rates
ALTER TABLE public.market_loan_rates ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for market_loan_rates (public read)
CREATE POLICY "Anyone can view market loan rates"
ON public.market_loan_rates
FOR SELECT
USING (true);

-- Create updated_at trigger for market_loan_rates
CREATE TRIGGER update_market_loan_rates_updated_at
BEFORE UPDATE ON public.market_loan_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample market rates
INSERT INTO public.market_loan_rates (loan_type, rate_type, current_rate, term_years, min_credit_score, source)
VALUES 
  ('mortgage', 'fixed', 6.875, 30, 620, 'Freddie Mac'),
  ('mortgage', 'fixed', 6.125, 15, 620, 'Freddie Mac'),
  ('auto', 'fixed', 7.18, 5, 700, 'Bankrate'),
  ('auto', 'fixed', 8.21, 5, 650, 'Bankrate'),
  ('personal', 'fixed', 12.35, 3, 700, 'LendingTree'),
  ('student', 'fixed', 5.50, 10, 650, 'Federal');

COMMENT ON TABLE public.market_loan_rates IS 'Current market interest rates for various loan types used in refinancing calculations';