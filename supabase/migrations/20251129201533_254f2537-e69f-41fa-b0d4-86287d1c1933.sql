-- Add is_active column to goals table
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add is_active column to debts table
ALTER TABLE public.debts 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add transaction_type column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'debit';

-- Update existing transactions to have correct transaction_type based on amount
UPDATE public.transactions 
SET transaction_type = CASE 
  WHEN amount < 0 THEN 'debit' 
  ELSE 'credit' 
END
WHERE transaction_type IS NULL;