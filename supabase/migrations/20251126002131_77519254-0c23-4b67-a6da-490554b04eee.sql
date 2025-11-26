
-- Add billing cycle fields to card_accounts
ALTER TABLE card_accounts 
ADD COLUMN billing_cycle_day integer DEFAULT 1,
ADD COLUMN next_statement_date date,
ADD COLUMN next_due_date date,
ADD COLUMN minimum_payment_cents bigint DEFAULT 0,
ADD COLUMN autopay_enabled boolean DEFAULT false,
ADD COLUMN autopay_amount_type text DEFAULT 'minimum',
ADD COLUMN last_statement_date date;

-- Create card_statements table
CREATE TABLE card_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES card_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  statement_date date NOT NULL,
  due_date date NOT NULL,
  previous_balance_cents bigint DEFAULT 0,
  payments_cents bigint DEFAULT 0,
  purchases_cents bigint DEFAULT 0,
  fees_cents bigint DEFAULT 0,
  interest_cents bigint DEFAULT 0,
  new_balance_cents bigint NOT NULL,
  minimum_payment_cents bigint NOT NULL,
  credit_limit_cents bigint NOT NULL,
  available_credit_cents bigint NOT NULL,
  pdf_path text,
  is_paid boolean DEFAULT false,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create card_payments table
CREATE TABLE card_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES card_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  statement_id uuid REFERENCES card_statements(id) ON DELETE SET NULL,
  amount_cents bigint NOT NULL,
  payment_method text NOT NULL,
  payment_date timestamptz DEFAULT now(),
  scheduled_date date,
  status text DEFAULT 'completed',
  confirmation_number text,
  payment_source jsonb,
  notes text,
  is_autopay boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE card_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for card_statements
CREATE POLICY "Users can view their own statements"
  ON card_statements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statements"
  ON card_statements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statements"
  ON card_statements FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for card_payments
CREATE POLICY "Users can view their own payments"
  ON card_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
  ON card_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments"
  ON card_payments FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_card_statements_account_id ON card_statements(account_id);
CREATE INDEX idx_card_statements_user_id ON card_statements(user_id);
CREATE INDEX idx_card_statements_statement_date ON card_statements(statement_date DESC);
CREATE INDEX idx_card_payments_account_id ON card_payments(account_id);
CREATE INDEX idx_card_payments_user_id ON card_payments(user_id);
CREATE INDEX idx_card_payments_payment_date ON card_payments(payment_date DESC);

-- Function to calculate next billing dates
CREATE OR REPLACE FUNCTION calculate_next_billing_dates(billing_day integer, from_date date DEFAULT CURRENT_DATE)
RETURNS TABLE(next_statement date, next_due date) AS $$
DECLARE
  statement_date date;
  due_date date;
BEGIN
  -- Calculate next statement date (billing_day of next month)
  IF EXTRACT(DAY FROM from_date) < billing_day THEN
    statement_date := DATE_TRUNC('month', from_date) + (billing_day - 1 || ' days')::interval;
  ELSE
    statement_date := DATE_TRUNC('month', from_date + interval '1 month') + (billing_day - 1 || ' days')::interval;
  END IF;
  
  -- Due date is 21 days after statement date
  due_date := statement_date + interval '21 days';
  
  RETURN QUERY SELECT statement_date, due_date;
END;
$$ LANGUAGE plpgsql;
