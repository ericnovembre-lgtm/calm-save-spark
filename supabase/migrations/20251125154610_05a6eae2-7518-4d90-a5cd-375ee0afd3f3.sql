-- Part 1: Add receipt columns to card_transactions
ALTER TABLE card_transactions 
ADD COLUMN IF NOT EXISTS receipt_image_path text,
ADD COLUMN IF NOT EXISTS receipt_matched_at timestamptz,
ADD COLUMN IF NOT EXISTS receipt_match_confidence numeric,
ADD COLUMN IF NOT EXISTS receipt_extracted_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS receipt_verified boolean DEFAULT false;

-- Part 2: Create card_subscriptions table
CREATE TABLE IF NOT EXISTS card_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id uuid REFERENCES cards(id) ON DELETE SET NULL,
  merchant_name text NOT NULL,
  ai_merchant_name text,
  amount_cents bigint NOT NULL,
  frequency text DEFAULT 'monthly', -- weekly, monthly, quarterly, yearly
  first_detected_at timestamptz DEFAULT now(),
  last_charge_date timestamptz,
  next_expected_date timestamptz,
  confidence numeric DEFAULT 0.8,
  status text DEFAULT 'active', -- active, paused, cancelled
  is_confirmed boolean DEFAULT false,
  cancel_reminder_enabled boolean DEFAULT false,
  cancel_reminder_days_before integer DEFAULT 3,
  category text,
  notes text,
  zombie_score numeric DEFAULT 0,
  last_usage_date timestamptz,
  usage_count_last_30_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_reminders table
CREATE TABLE IF NOT EXISTS subscription_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES card_subscriptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_date date NOT NULL,
  reminder_type text DEFAULT 'cancel', -- cancel, price_increase, renewal
  message text,
  is_sent boolean DEFAULT false,
  sent_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE card_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies for card_subscriptions
CREATE POLICY "Users see own card subscriptions" ON card_subscriptions
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- RLS policies for subscription_reminders
CREATE POLICY "Users see own reminders" ON subscription_reminders
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_subscriptions_user_id ON card_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_card_subscriptions_status ON card_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_card_subscriptions_next_expected ON card_subscriptions(next_expected_date);
CREATE INDEX IF NOT EXISTS idx_subscription_reminders_user_id ON subscription_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_reminders_date ON subscription_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_card_transactions_receipt ON card_transactions(receipt_image_path) WHERE receipt_image_path IS NOT NULL;