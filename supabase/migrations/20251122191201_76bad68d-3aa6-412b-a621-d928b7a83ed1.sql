-- Fix search_path for the market data timestamp function
CREATE OR REPLACE FUNCTION update_market_data_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$;