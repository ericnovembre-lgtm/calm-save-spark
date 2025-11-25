-- Add geographic columns to card_transactions
ALTER TABLE card_transactions 
ADD COLUMN IF NOT EXISTS merchant_lat numeric,
ADD COLUMN IF NOT EXISTS merchant_lon numeric,
ADD COLUMN IF NOT EXISTS merchant_city text,
ADD COLUMN IF NOT EXISTS merchant_state text,
ADD COLUMN IF NOT EXISTS merchant_country text DEFAULT 'US',
ADD COLUMN IF NOT EXISTS geo_confidence numeric;

-- Create merchant_locations cache table
CREATE TABLE IF NOT EXISTS merchant_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name text NOT NULL UNIQUE,
  lat numeric NOT NULL,
  lon numeric NOT NULL,
  city text,
  state text,
  country text DEFAULT 'US',
  confidence numeric,
  source text, -- 'ai' or 'mapbox'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE merchant_locations ENABLE ROW LEVEL SECURITY;

-- Public read for authenticated users
CREATE POLICY "Merchant locations readable by authenticated" ON merchant_locations
  FOR SELECT TO authenticated USING (true);

-- Insert sample demo transactions with realistic NYC locations
INSERT INTO card_transactions (
  card_id, account_id, user_id, merchant_name, amount_cents, transaction_date,
  ai_merchant_name, ai_category, merchant_lat, merchant_lon, merchant_city, merchant_state, geo_confidence
)
SELECT 
  ca.id,
  ca.id,
  ca.user_id,
  merchant_data.merchant,
  merchant_data.amount,
  now() - (random() * interval '30 days'),
  merchant_data.clean_name,
  merchant_data.category,
  merchant_data.lat,
  merchant_data.lon,
  merchant_data.city,
  merchant_data.state,
  0.95
FROM card_accounts ca
CROSS JOIN (
  VALUES 
    ('STARBUCKS #12345 NEW YORK NY', 'Starbucks', 'Dining', 595, 40.7580, -73.9855, 'New York', 'NY'),
    ('TARGET T-0234 NEW YORK', 'Target', 'Shopping', 12499, 40.7484, -73.9857, 'New York', 'NY'),
    ('WHOLE FOODS MKT #10155', 'Whole Foods', 'Groceries', 8750, 40.7410, -74.0018, 'New York', 'NY'),
    ('APPLE STORE #R123', 'Apple Store', 'Electronics', 129900, 40.7637, -73.9731, 'New York', 'NY'),
    ('CHIPOTLE 2345', 'Chipotle', 'Dining', 1295, 40.7489, -73.9680, 'New York', 'NY'),
    ('UBER TRIP', 'Uber', 'Transportation', 2150, 40.7614, -73.9776, 'New York', 'NY'),
    ('AMAZON.COM', 'Amazon', 'Shopping', 4999, 40.7580, -73.9855, 'New York', 'NY'),
    ('SHAKE SHACK', 'Shake Shack', 'Dining', 1875, 40.7414, -73.9883, 'New York', 'NY'),
    ('CVS/PHARMACY #9876', 'CVS', 'Healthcare', 3249, 40.7500, -73.9800, 'New York', 'NY'),
    ('TRADER JOES #542', 'Trader Joes', 'Groceries', 6542, 40.7282, -73.9942, 'New York', 'NY'),
    ('BLUESTONE LANE COFFEE', 'Bluestone Lane', 'Dining', 725, 40.7589, -73.9851, 'New York', 'NY'),
    ('LYFT RIDE', 'Lyft', 'Transportation', 1890, 40.7505, -73.9934, 'New York', 'NY'),
    ('SWEETGREEN', 'Sweetgreen', 'Dining', 1450, 40.7420, -73.9897, 'New York', 'NY'),
    ('SEPHORA #567', 'Sephora', 'Shopping', 8900, 40.7614, -73.9776, 'New York', 'NY'),
    ('JOE COFFEE COMPANY', 'Joe Coffee', 'Dining', 595, 40.7350, -73.9973, 'New York', 'NY')
) AS merchant_data(merchant, clean_name, category, amount, lat, lon, city, state)
WHERE ca.account_type = 'secured_credit'
LIMIT 5;