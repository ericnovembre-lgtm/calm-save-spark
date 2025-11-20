-- Add plaid_transaction_id column to transactions table for deduplication
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS plaid_transaction_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_plaid_transaction_id 
ON public.transactions(plaid_transaction_id) WHERE plaid_transaction_id IS NOT NULL;