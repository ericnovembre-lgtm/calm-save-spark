-- Phase 1: Database Schema Enhancement
-- Add missing fields to debts table for enhanced debt management

-- Add status field for tracking debt lifecycle (active, closed, paid_off)
ALTER TABLE public.debts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
CHECK (status IN ('active', 'closed', 'paid_off'));

-- Add actual_payment field (user's actual monthly payment, can differ from minimum)
ALTER TABLE public.debts 
ADD COLUMN IF NOT EXISTS actual_payment NUMERIC;

-- Add original_balance field for progress tracking
ALTER TABLE public.debts 
ADD COLUMN IF NOT EXISTS original_balance NUMERIC;

-- Create index on status for efficient filtering
CREATE INDEX IF NOT EXISTS idx_debts_status ON public.debts(status);

-- Create index on user_id and status for common queries
CREATE INDEX IF NOT EXISTS idx_debts_user_status ON public.debts(user_id, status);

-- Update existing debts to set original_balance = current_balance if null
UPDATE public.debts 
SET original_balance = current_balance 
WHERE original_balance IS NULL;

-- Update existing debts to set actual_payment = minimum_payment if null
UPDATE public.debts 
SET actual_payment = minimum_payment 
WHERE actual_payment IS NULL;