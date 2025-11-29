-- Fix Security Warning: Add search_path to all 6 functions to prevent schema injection attacks

-- 1. clean_expired_insights_cache
CREATE OR REPLACE FUNCTION public.clean_expired_insights_cache()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.insights_cache WHERE expires_at < now();
END;
$function$;

-- 2. update_budget_spending_timestamp
CREATE OR REPLACE FUNCTION public.update_budget_spending_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$function$;

-- 3. update_portfolio_goals_updated_at
CREATE OR REPLACE FUNCTION public.update_portfolio_goals_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 4. update_recurring_transactions_updated_at
CREATE OR REPLACE FUNCTION public.update_recurring_transactions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 5. update_transaction_splits_updated_at
CREATE OR REPLACE FUNCTION public.update_transaction_splits_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 6. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix Security Warning: Remove materialized view from PostgREST API
-- Revoke API access to prevent unauthorized data exposure
REVOKE ALL ON public.script_variant_performance FROM anon;
REVOKE ALL ON public.script_variant_performance FROM authenticated;

-- Document the restriction
COMMENT ON MATERIALIZED VIEW public.script_variant_performance IS 
  'Internal analytics view - not exposed via API for security reasons. Access only via service role or direct database connection.';