-- Create transaction_splits table for shared expense tracking
CREATE TABLE IF NOT EXISTS transaction_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  split_name TEXT NOT NULL,
  split_amount NUMERIC NOT NULL CHECK (split_amount > 0),
  split_percentage NUMERIC CHECK (split_percentage >= 0 AND split_percentage <= 100),
  assigned_to TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'waived')),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transaction_splits_parent ON transaction_splits(parent_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_user ON transaction_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_payment_status ON transaction_splits(payment_status);

-- Enable RLS
ALTER TABLE transaction_splits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own splits"
  ON transaction_splits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own splits"
  ON transaction_splits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own splits"
  ON transaction_splits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own splits"
  ON transaction_splits FOR DELETE
  USING (auth.uid() = user_id);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_transaction_splits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_splits_updated_at
  BEFORE UPDATE ON transaction_splits
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_splits_updated_at();