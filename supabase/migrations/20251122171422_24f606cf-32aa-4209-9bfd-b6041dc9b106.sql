-- Fix search_path security warning for auto_enrich_transaction function
CREATE OR REPLACE FUNCTION auto_enrich_transaction()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;