-- Create competitor pricing table
CREATE TABLE IF NOT EXISTS competitor_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  provider TEXT NOT NULL,
  plan_name TEXT,
  monthly_price NUMERIC NOT NULL,
  speed TEXT,
  features JSONB DEFAULT '{}',
  market_region TEXT DEFAULT 'US',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  source TEXT,
  CONSTRAINT valid_category CHECK (category IN ('internet', 'mobile', 'utilities', 'streaming', 'insurance'))
);

CREATE INDEX idx_competitor_category ON competitor_pricing(category);
CREATE INDEX idx_competitor_updated ON competitor_pricing(last_updated);
CREATE INDEX idx_competitor_price ON competitor_pricing(monthly_price);

-- Create competitor alerts table
CREATE TABLE IF NOT EXISTS competitor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES bill_negotiation_opportunities(id) ON DELETE CASCADE,
  competitor_provider TEXT NOT NULL,
  competitor_price NUMERIC NOT NULL,
  user_current_price NUMERIC NOT NULL,
  potential_savings NUMERIC NOT NULL,
  alert_type TEXT DEFAULT 'better_deal',
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_alert_type CHECK (alert_type IN ('better_deal', 'price_drop', 'new_provider'))
);

CREATE INDEX idx_alerts_user ON competitor_alerts(user_id);
CREATE INDEX idx_alerts_acknowledged ON competitor_alerts(acknowledged);
CREATE INDEX idx_alerts_created ON competitor_alerts(created_at DESC);

-- Enable RLS
ALTER TABLE competitor_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for competitor_pricing (public read)
CREATE POLICY "Anyone can view competitor pricing"
  ON competitor_pricing FOR SELECT
  USING (true);

-- RLS policies for competitor_alerts (user-specific)
CREATE POLICY "Users can view their own alerts"
  ON competitor_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON competitor_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert alerts"
  ON competitor_alerts FOR INSERT
  WITH CHECK (true);

-- Insert mock competitor data
INSERT INTO competitor_pricing (category, provider, plan_name, monthly_price, speed, features, market_region) VALUES
  -- Internet providers
  ('internet', 'Verizon', 'Fios 500 Mbps', 39.99, '500 Mbps', '{"wifi_included": true, "modem_rental": false, "contract": "none"}', 'US'),
  ('internet', 'Verizon', 'Fios 1 Gig', 64.99, '1000 Mbps', '{"wifi_included": true, "modem_rental": false, "contract": "none"}', 'US'),
  ('internet', 'AT&T', 'Fiber 500', 55.00, '500 Mbps', '{"wifi_included": true, "modem_rental": true, "contract": "12 months"}', 'US'),
  ('internet', 'AT&T', 'Fiber 1000', 80.00, '1000 Mbps', '{"wifi_included": true, "modem_rental": true, "contract": "12 months"}', 'US'),
  ('internet', 'Xfinity', 'Performance Pro', 69.99, '300 Mbps', '{"wifi_included": false, "modem_rental": true, "contract": "12 months"}', 'US'),
  ('internet', 'Xfinity', 'Blast Pro', 89.99, '600 Mbps', '{"wifi_included": false, "modem_rental": true, "contract": "12 months"}', 'US'),
  ('internet', 'Spectrum', 'Internet Ultra', 49.99, '500 Mbps', '{"wifi_included": true, "modem_rental": false, "contract": "none"}', 'US'),
  ('internet', 'T-Mobile', '5G Home Internet', 50.00, '100-300 Mbps', '{"wifi_included": true, "modem_rental": false, "contract": "none"}', 'US'),
  
  -- Mobile providers
  ('mobile', 'T-Mobile', 'Magenta', 70.00, null, '{"unlimited_data": true, "hotspot": "5GB", "international": true}', 'US'),
  ('mobile', 'T-Mobile', 'Magenta Max', 85.00, null, '{"unlimited_data": true, "hotspot": "40GB", "international": true, "4k_streaming": true}', 'US'),
  ('mobile', 'Verizon', 'Play More Unlimited', 80.00, null, '{"unlimited_data": true, "hotspot": "25GB", "disney_plus": true}', 'US'),
  ('mobile', 'Verizon', 'Do More Unlimited', 80.00, null, '{"unlimited_data": true, "hotspot": "25GB", "cloud_storage": "600GB"}', 'US'),
  ('mobile', 'AT&T', 'Unlimited Premium', 85.00, null, '{"unlimited_data": true, "hotspot": "50GB", "hbo_max": true}', 'US'),
  ('mobile', 'AT&T', 'Unlimited Extra', 75.00, null, '{"unlimited_data": true, "hotspot": "15GB"}', 'US'),
  ('mobile', 'Visible', 'Visible+', 45.00, null, '{"unlimited_data": true, "hotspot": "unlimited", "international": true}', 'US'),
  ('mobile', 'Mint Mobile', '10GB Plan', 20.00, null, '{"data": "10GB", "hotspot": true}', 'US'),
  
  -- Streaming services
  ('streaming', 'YouTube TV', 'Base Plan', 72.99, null, '{"channels": 100, "dvr": "unlimited", "streams": 3}', 'US'),
  ('streaming', 'Hulu + Live TV', 'Base Plan', 76.99, null, '{"channels": 95, "dvr": "unlimited", "streams": 2}', 'US'),
  ('streaming', 'Sling TV', 'Orange + Blue', 55.00, null, '{"channels": 50, "dvr": "50 hours", "streams": 4}', 'US'),
  ('streaming', 'FuboTV', 'Pro Plan', 74.99, null, '{"channels": 180, "dvr": "1000 hours", "streams": 10}', 'US'),
  
  -- Insurance
  ('insurance', 'Progressive', 'Full Coverage', 140.00, null, '{"liability": "100/300/100", "deductible": 500}', 'US'),
  ('insurance', 'Geico', 'Full Coverage', 135.00, null, '{"liability": "100/300/100", "deductible": 500}', 'US'),
  ('insurance', 'State Farm', 'Full Coverage', 155.00, null, '{"liability": "100/300/100", "deductible": 500}', 'US'),
  ('insurance', 'Allstate', 'Full Coverage', 160.00, null, '{"liability": "100/300/100", "deductible": 500}', 'US')
ON CONFLICT DO NOTHING;