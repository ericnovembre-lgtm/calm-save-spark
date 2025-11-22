-- Phase 5: Database Schema Additions

-- Merchant enrichment cache
CREATE TABLE IF NOT EXISTS merchant_enrichment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_merchant TEXT NOT NULL UNIQUE,
  cleaned_name TEXT NOT NULL,
  suggested_category TEXT,
  confidence_score FLOAT NOT NULL,
  logo_url TEXT,
  times_used INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Merchant logos cache
CREATE TABLE IF NOT EXISTS merchant_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name TEXT NOT NULL UNIQUE,
  logo_url TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('clearbit', 'manual', 'generated')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User filter presets
CREATE TABLE IF NOT EXISTS transaction_filter_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add enrichment metadata to transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS enrichment_metadata JSONB DEFAULT '{}'::jsonb;

-- Add full-text search index
CREATE INDEX IF NOT EXISTS idx_transactions_search 
ON transactions USING gin(
  to_tsvector('english', 
    coalesce(merchant, '') || ' ' || coalesce(description, '')
  )
);

-- Add compound indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON transactions(user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_category 
ON transactions(user_id, category) 
WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_user_merchant
ON transactions(user_id, merchant)
WHERE merchant IS NOT NULL;

-- Auto-enrichment trigger function
CREATE OR REPLACE FUNCTION auto_enrich_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if merchant needs cleaning (has patterns like "ACH", "WID", etc.)
  IF NEW.merchant IS NOT NULL AND NEW.merchant ~ '(ACH|WID|DEBIT|CREDIT|PYMT|TRNSFR|XFER|\d{4,})' THEN
    NEW.enrichment_metadata = jsonb_set(
      COALESCE(NEW.enrichment_metadata, '{}'::jsonb),
      '{needs_enrichment}', 
      'true'::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_enrich ON transactions;
CREATE TRIGGER trigger_auto_enrich
BEFORE INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION auto_enrich_transaction();

-- RLS Policies
ALTER TABLE merchant_enrichment ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_filter_presets ENABLE ROW LEVEL SECURITY;

-- Everyone can read merchant enrichment (shared cache)
CREATE POLICY "Anyone can read merchant enrichment"
ON merchant_enrichment FOR SELECT
USING (true);

-- Everyone can read merchant logos (shared cache)
CREATE POLICY "Anyone can read merchant logos"
ON merchant_logos FOR SELECT
USING (true);

-- Users can manage their own filter presets
CREATE POLICY "Users can manage their own filter presets"
ON transaction_filter_presets FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);