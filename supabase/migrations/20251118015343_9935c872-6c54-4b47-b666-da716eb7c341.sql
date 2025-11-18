-- Add target_date and notes columns to pots table
ALTER TABLE public.pots 
ADD COLUMN IF NOT EXISTS target_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT;