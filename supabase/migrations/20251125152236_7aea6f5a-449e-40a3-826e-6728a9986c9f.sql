-- Part 1: Add AI enrichment columns to card_transactions
ALTER TABLE card_transactions 
ADD COLUMN IF NOT EXISTS ai_merchant_name text,
ADD COLUMN IF NOT EXISTS ai_category text,
ADD COLUMN IF NOT EXISTS ai_confidence numeric,
ADD COLUMN IF NOT EXISTS enrichment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS enriched_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_card_transactions_enrichment_status ON card_transactions(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_card_transactions_ai_category ON card_transactions(ai_category);

-- Part 2: Create redemption catalog table
CREATE TABLE IF NOT EXISTS redemption_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  redemption_type text NOT NULL CHECK (redemption_type IN ('cashback', 'gift_card', 'travel_credit')),
  name text NOT NULL,
  description text,
  points_cost integer NOT NULL CHECK (points_cost > 0),
  dollar_value numeric NOT NULL CHECK (dollar_value > 0),
  partner_name text,
  partner_logo_url text,
  min_points integer DEFAULT 1000,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create points redemptions table
CREATE TABLE IF NOT EXISTS points_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  catalog_item_id uuid REFERENCES redemption_catalog(id),
  points_spent integer NOT NULL CHECK (points_spent > 0),
  dollar_value numeric NOT NULL CHECK (dollar_value > 0),
  redemption_type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  fulfillment_details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE redemption_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_redemptions ENABLE ROW LEVEL SECURITY;

-- Catalog is readable by all authenticated users
CREATE POLICY "Catalog readable by authenticated" ON redemption_catalog
  FOR SELECT TO authenticated USING (is_active = true);

-- Users can only see their own redemptions
CREATE POLICY "Users view own redemptions" ON points_redemptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Users can insert their own redemptions
CREATE POLICY "Users create own redemptions" ON points_redemptions
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- Users can update their own redemptions (for cancellation)
CREATE POLICY "Users update own redemptions" ON points_redemptions
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid());

-- Seed catalog with redemption options
INSERT INTO redemption_catalog (redemption_type, name, description, points_cost, dollar_value, partner_name, min_points) VALUES
('cashback', 'Statement Credit - $25', 'Apply $25 credit to your card balance', 2500, 25.00, NULL, 2500),
('cashback', 'Statement Credit - $50', 'Apply $50 credit to your card balance', 5000, 50.00, NULL, 5000),
('cashback', 'Direct Deposit - $100', 'Transfer $100 cash to your linked bank', 10000, 100.00, NULL, 10000),
('gift_card', 'Amazon Gift Card - $20', 'Shop millions of items on Amazon', 2000, 20.00, 'Amazon', 2000),
('gift_card', 'Amazon Gift Card - $50', 'Shop millions of items on Amazon', 5000, 50.00, 'Amazon', 5000),
('gift_card', 'Starbucks Gift Card - $10', 'Coffee and treats at Starbucks', 1000, 10.00, 'Starbucks', 1000),
('gift_card', 'Starbucks Gift Card - $25', 'Coffee and treats at Starbucks', 2500, 25.00, 'Starbucks', 2500),
('gift_card', 'Target Gift Card - $25', 'Everything you need at Target', 2500, 25.00, 'Target', 2500),
('gift_card', 'Target Gift Card - $50', 'Everything you need at Target', 5000, 50.00, 'Target', 5000),
('travel_credit', 'Airline Credit - $50', 'Use on any flight booking', 5000, 50.00, 'Any Airline', 5000),
('travel_credit', 'Airline Credit - $100', 'Use on any flight booking', 10000, 100.00, 'Any Airline', 10000),
('travel_credit', 'Hotel Credit - $50', 'Apply to hotel stays worldwide', 5000, 50.00, 'Any Hotel', 5000),
('travel_credit', 'TSA PreCheck Credit', 'Skip airport security lines', 8500, 85.00, 'TSA', 8500)
ON CONFLICT DO NOTHING;