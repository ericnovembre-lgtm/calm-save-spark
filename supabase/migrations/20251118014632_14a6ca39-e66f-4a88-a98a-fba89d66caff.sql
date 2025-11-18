-- Add target_date and notes columns to pots table
ALTER TABLE public.pots
ADD COLUMN IF NOT EXISTS target_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN public.pots.target_date IS 'Optional target date for achieving pot goal';
COMMENT ON COLUMN public.pots.notes IS 'Optional notes or description for the pot';