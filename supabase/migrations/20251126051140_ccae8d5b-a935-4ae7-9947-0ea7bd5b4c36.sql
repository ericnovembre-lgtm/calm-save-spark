-- Fix search_path security warnings for all affected functions
-- This prevents potential search_path manipulation attacks

ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_plaid_items_updated_at() SET search_path = public;
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = public;
ALTER FUNCTION public.log_budget_activity() SET search_path = public;
ALTER FUNCTION public.update_investment_alert_settings_timestamp() SET search_path = public;
ALTER FUNCTION public.update_wallet_contacts_updated_at() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_nudges() SET search_path = public;
ALTER FUNCTION public.update_card_spend_rules_updated_at() SET search_path = public;
ALTER FUNCTION public.user_organization_ids(user_uuid uuid) SET search_path = public;