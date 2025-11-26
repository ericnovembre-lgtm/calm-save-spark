-- Add dispute tracking columns to card_transactions
ALTER TABLE card_transactions 
ADD COLUMN IF NOT EXISTS dispute_status text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS dispute_reason text,
ADD COLUMN IF NOT EXISTS dispute_submitted_at timestamptz,
ADD COLUMN IF NOT EXISTS dispute_resolved_at timestamptz,
ADD COLUMN IF NOT EXISTS dispute_letter_path text;

-- Add check constraint for dispute_status
DO $$ BEGIN
  ALTER TABLE card_transactions ADD CONSTRAINT card_transactions_dispute_status_check 
  CHECK (dispute_status IS NULL OR dispute_status IN ('pending', 'investigating', 'resolved', 'rejected'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Insert comprehensive card benefits across all tiers using only valid categories: protection, purchase, travel, lifestyle
INSERT INTO card_benefits (card_tier, benefit_category, benefit_name, description, icon, trigger_merchant_categories, trigger_keywords)
SELECT * FROM (VALUES
  -- Basic tier
  ('basic', 'purchase', '1% Cashback on All Purchases', 'Earn 1% cash back on every purchase, no restrictions', 'percent', ARRAY['all'], ARRAY['cashback']),
  ('basic', 'protection', 'Zero Liability Protection', 'Not responsible for unauthorized charges', 'shield', ARRAY['all'], ARRAY['fraud', 'unauthorized']),
  
  -- Growth tier  
  ('growth', 'lifestyle', '3x Points on Dining', 'Triple points at restaurants, cafes, and food delivery', 'utensils', ARRAY['restaurants'], ARRAY['restaurant', 'food', 'dining']),
  ('growth', 'purchase', '2% Cashback on Gas', 'Double cash back at gas stations', 'fuel', ARRAY['gas'], ARRAY['gas', 'fuel', 'petrol']),
  ('growth', 'protection', 'Emergency Card Replacement', 'Get a replacement card shipped overnight anywhere', 'truck', ARRAY['all'], ARRAY['lost', 'stolen', 'damaged']),
  
  -- Prestige tier
  ('prestige', 'lifestyle', '4x Points on Restaurants', 'Quadruple points on dining worldwide', 'utensils', ARRAY['restaurants'], ARRAY['restaurant', 'dining', 'meal']),
  ('prestige', 'purchase', '3x Points on Online Shopping', 'Triple points for all e-commerce purchases', 'shopping-cart', ARRAY['online_shopping'], ARRAY['amazon', 'shop', 'online']),
  ('prestige', 'protection', '24/7 Emergency Assistance', 'Global concierge and emergency services', 'phone', ARRAY['all'], ARRAY['emergency', 'help', 'assistance']),
  ('prestige', 'travel', 'Global Entry/TSA PreCheck Credit', '$100 statement credit for TSA PreCheck or Global Entry', 'plane-takeoff', ARRAY['travel'], ARRAY['tsa', 'global entry', 'airport']),
  
  -- Elite Legacy tier
  ('elite_legacy', 'lifestyle', '5x Points on Fine Dining', 'Five times points at premium restaurants', 'wine', ARRAY['restaurants'], ARRAY['restaurant', 'fine dining', 'michelin']),
  ('elite_legacy', 'purchase', '4x Points on Luxury Shopping', 'Quadruple points at luxury retailers', 'gem', ARRAY['luxury', 'shopping'], ARRAY['luxury', 'designer', 'boutique']),
  ('elite_legacy', 'travel', 'Medical Evacuation Coverage', 'Emergency medical transport up to $500,000', 'ambulance', ARRAY['all'], ARRAY['medical', 'emergency', 'evacuation']),
  ('elite_legacy', 'travel', 'Primary Rental Car Coverage', 'Full rental car insurance at no cost', 'car', ARRAY['car_rental'], ARRAY['rental', 'car', 'collision']),
  ('elite_legacy', 'lifestyle', 'Annual Travel Credit', '$300 annual statement credit for travel purchases', 'ticket', ARRAY['airlines', 'hotels'], ARRAY['flight', 'hotel', 'travel'])
) AS v(card_tier, benefit_category, benefit_name, description, icon, trigger_merchant_categories, trigger_keywords)
WHERE NOT EXISTS (
  SELECT 1 FROM card_benefits cb 
  WHERE cb.card_tier = v.card_tier AND cb.benefit_name = v.benefit_name
);