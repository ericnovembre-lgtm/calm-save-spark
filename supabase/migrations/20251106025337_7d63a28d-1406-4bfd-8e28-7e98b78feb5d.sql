-- Create scheduled_transfers table
CREATE TABLE public.scheduled_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pot_id UUID NOT NULL REFERENCES public.pots(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday (for weekly)
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 28), -- 1-28 (for monthly)
  is_active BOOLEAN NOT NULL DEFAULT true,
  next_transfer_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_transfer_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_transfers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own scheduled transfers"
ON public.scheduled_transfers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled transfers"
ON public.scheduled_transfers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled transfers"
ON public.scheduled_transfers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled transfers"
ON public.scheduled_transfers
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_scheduled_transfers_user_id ON public.scheduled_transfers(user_id);
CREATE INDEX idx_scheduled_transfers_next_date ON public.scheduled_transfers(next_transfer_date) WHERE is_active = true;

-- Create trigger for updated_at
CREATE TRIGGER update_scheduled_transfers_updated_at
BEFORE UPDATE ON public.scheduled_transfers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create transfer_history table to track all transfers
CREATE TABLE public.transfer_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pot_id UUID NOT NULL REFERENCES public.pots(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('manual', 'scheduled', 'automated')),
  scheduled_transfer_id UUID REFERENCES public.scheduled_transfers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'pending')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transfer_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transfer history"
ON public.transfer_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transfer history"
ON public.transfer_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_transfer_history_user_id ON public.transfer_history(user_id);
CREATE INDEX idx_transfer_history_created_at ON public.transfer_history(created_at DESC);