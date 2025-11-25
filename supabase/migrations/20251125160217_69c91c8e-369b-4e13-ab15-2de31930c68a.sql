-- Create card_benefits table to store card perk rules
CREATE TABLE card_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_tier text NOT NULL CHECK (card_tier IN ('basic', 'growth', 'prestige', 'elite_legacy')),
  benefit_category text NOT NULL CHECK (benefit_category IN ('travel', 'purchase', 'lifestyle', 'protection')),
  benefit_name text NOT NULL,
  description text NOT NULL,
  activation_required boolean DEFAULT false,
  activation_url text,
  trigger_merchant_categories text[],
  trigger_keywords text[],
  trigger_min_amount_cents bigint,
  validity_days integer DEFAULT 30,
  fine_print text,
  icon text DEFAULT 'gift',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE card_benefits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read card benefits
CREATE POLICY "Anyone can read card benefits" 
ON card_benefits FOR SELECT 
USING (is_active = true);

-- Create benefit_matches table to track user-specific matched benefits
CREATE TABLE benefit_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES card_transactions(id) ON DELETE SET NULL,
  benefit_id uuid NOT NULL REFERENCES card_benefits(id) ON DELETE CASCADE,
  match_confidence numeric DEFAULT 0.8 CHECK (match_confidence >= 0 AND match_confidence <= 1),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'activated', 'expired', 'dismissed')),
  expires_at timestamptz,
  activated_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE benefit_matches ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own benefit matches
CREATE POLICY "Users can view own benefit matches" 
ON benefit_matches FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own benefit matches" 
ON benefit_matches FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own benefit matches" 
ON benefit_matches FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_benefit_matches_user_status ON benefit_matches(user_id, status);
CREATE INDEX idx_benefit_matches_expires ON benefit_matches(expires_at) WHERE status = 'pending';

-- Insert mock card benefits (fine print)
INSERT INTO card_benefits (card_tier, benefit_category, benefit_name, description, activation_required, activation_url, trigger_merchant_categories, trigger_keywords, trigger_min_amount_cents, validity_days, fine_print, icon) VALUES
  -- Travel Benefits
  ('prestige', 'travel', 'Free Airport Lounge Access', 'Access to over 1,000 airport lounges worldwide. Must activate pass before travel.', true, 'https://example.com/activate-lounge', ARRAY['airlines', 'travel'], ARRAY['airline', 'flight', 'ticket', 'delta', 'united', 'american'], 10000, 90, 'Valid for cardholder and up to 2 guests. Must show boarding pass. Not valid on domestic budget airlines.', 'plane'),
  
  ('growth', 'travel', 'Rental Car Insurance', 'Complimentary collision damage waiver for rental cars up to $75,000.', false, null, ARRAY['car_rental'], ARRAY['hertz', 'enterprise', 'avis', 'rental', 'car'], 5000, 30, 'Must decline rental company insurance. Coverage is secondary. Not valid for trucks or luxury vehicles.', 'car'),
  
  ('prestige', 'travel', 'Trip Delay Coverage', 'Reimbursement up to $500 per ticket for delays over 6 hours.', true, 'https://example.com/file-claim', ARRAY['airlines', 'travel'], ARRAY['flight', 'airline', 'ticket'], 25000, 180, 'Must be booked with card. Keep all receipts. File claim within 90 days of delay.', 'clock'),
  
  ('elite_legacy', 'travel', 'Lost Luggage Protection', 'Coverage up to $3,000 per passenger for lost or delayed luggage.', true, 'https://example.com/luggage-claim', ARRAY['airlines', 'travel'], ARRAY['flight', 'airline'], 10000, 180, 'Must file report with airline first. Keep baggage claim tickets. Coverage after 6 hour delay.', 'luggage'),
  
  -- Purchase Protection Benefits
  ('growth', 'purchase', 'Extended Warranty', 'Extends manufacturer warranty by 1 additional year on eligible purchases.', false, null, ARRAY['electronics', 'appliances'], ARRAY['laptop', 'phone', 'tablet', 'tv', 'appliance', 'best buy', 'apple'], 5000, 90, 'Keep original receipt and warranty. Max $10,000 per claim. Electronics and appliances only.', 'shield'),
  
  ('prestige', 'purchase', 'Price Protection', 'Refund the difference if you find a lower price within 60 days.', true, 'https://example.com/price-match', ARRAY['retail', 'electronics', 'clothing'], ARRAY[''], 5000, 60, 'Must provide proof of lower price. Max $500 per item, $2,500 per year. Excludes limited-time sales.', 'tag'),
  
  ('elite_legacy', 'purchase', 'Purchase Protection', 'Coverage for theft or damage within 90 days of purchase.', true, 'https://example.com/purchase-claim', ARRAY['retail', 'electronics', 'jewelry'], ARRAY[''], 10000, 90, 'Up to $10,000 per claim. Must file police report for theft. Keep receipts and photos.', 'shield-check'),
  
  -- Lifestyle Benefits
  ('prestige', 'lifestyle', 'Cell Phone Protection', 'Coverage up to $800 for damaged or stolen phones (with $50 deductible).', true, 'https://example.com/phone-claim', ARRAY['telecommunications'], ARRAY['verizon', 'att', 'tmobile', 'sprint', 'phone', 'wireless'], 1000, 120, 'Must pay monthly phone bill with card. Max 2 claims per year. Keep phone receipt.', 'smartphone'),
  
  ('growth', 'lifestyle', 'Streaming Credits', '$15 monthly credit for eligible streaming services.', false, null, ARRAY['entertainment'], ARRAY['netflix', 'spotify', 'hulu', 'disney', 'streaming'], 500, 30, 'Automatic credit. Qualifying services: Netflix, Spotify Premium, Hulu, Disney+, HBO Max.', 'tv'),
  
  ('elite_legacy', 'lifestyle', 'Concierge Service', '24/7 personal concierge for travel, dining, and entertainment bookings.', false, 'https://example.com/concierge', ARRAY['restaurants', 'entertainment', 'travel'], ARRAY[''], 0, 365, 'Complimentary service. Available 24/7. Can assist with reservations, tickets, and travel planning.', 'sparkles'),
  
  -- General Protection
  ('basic', 'protection', 'Fraud Protection', '$0 liability for unauthorized transactions reported within 60 days.', false, null, ARRAY[''], ARRAY[''], 0, 60, 'Must report fraud immediately. May require police report. Card will be replaced.', 'shield-alert');

COMMENT ON TABLE card_benefits IS 'Card benefit rules (fine print) that trigger based on transaction patterns';
COMMENT ON TABLE benefit_matches IS 'User-specific benefit matches detected by Benefit Hunter agent';