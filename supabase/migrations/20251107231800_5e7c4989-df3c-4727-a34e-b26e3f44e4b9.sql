-- Update compute_user_features() to support $0-$20 range
-- Enhanced tier system with more granular feature unlocking

CREATE OR REPLACE FUNCTION public.compute_user_features(sub_amount numeric)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  features jsonb := '{
    "goals_limit": 3,
    "pots_limit": 2,
    "automations_limit": 1,
    "ai_insights": false,
    "advanced_analytics": false,
    "priority_support": false,
    "debt_management": false,
    "investment_tracking": false,
    "credit_monitoring": false,
    "subscription_insights": false,
    "budget_templates": false,
    "cashflow_forecast": false,
    "custom_automation": false,
    "api_access": false,
    "white_label": false,
    "enterprise_features": false
  }'::jsonb;
BEGIN
  -- Tier 1: $0-5 - Basic Features
  IF sub_amount >= 1 THEN
    features := jsonb_set(features, '{goals_limit}', '5'::jsonb);
  END IF;
  
  IF sub_amount >= 2 THEN
    features := jsonb_set(features, '{pots_limit}', '3'::jsonb);
  END IF;
  
  IF sub_amount >= 3 THEN
    features := jsonb_set(features, '{automations_limit}', '2'::jsonb);
  END IF;

  -- Tier 2: $4-8 - Enhanced Features
  IF sub_amount >= 4 THEN
    features := jsonb_set(features, '{goals_limit}', '10'::jsonb);
    features := jsonb_set(features, '{pots_limit}', '5'::jsonb);
  END IF;

  IF sub_amount >= 5 THEN
    features := jsonb_set(features, '{automations_limit}', '5'::jsonb);
  END IF;

  IF sub_amount >= 6 THEN
    features := jsonb_set(features, '{ai_insights}', 'true'::jsonb);
  END IF;

  IF sub_amount >= 7 THEN
    features := jsonb_set(features, '{priority_support}', 'true'::jsonb);
  END IF;

  -- Tier 3: $8-12 - Premium Features
  IF sub_amount >= 8 THEN
    features := jsonb_set(features, '{goals_limit}', '999'::jsonb);
    features := jsonb_set(features, '{pots_limit}', '999'::jsonb);
  END IF;

  IF sub_amount >= 9 THEN
    features := jsonb_set(features, '{debt_management}', 'true'::jsonb);
  END IF;

  IF sub_amount >= 10 THEN
    features := jsonb_set(features, '{investment_tracking}', 'true'::jsonb);
  END IF;

  IF sub_amount >= 11 THEN
    features := jsonb_set(features, '{credit_monitoring}', 'true'::jsonb);
  END IF;

  IF sub_amount >= 12 THEN
    features := jsonb_set(features, '{subscription_insights}', 'true'::jsonb);
  END IF;

  -- Tier 4: $13-16 - Advanced Features
  IF sub_amount >= 13 THEN
    features := jsonb_set(features, '{budget_templates}', 'true'::jsonb);
  END IF;

  IF sub_amount >= 14 THEN
    features := jsonb_set(features, '{cashflow_forecast}', 'true'::jsonb);
    features := jsonb_set(features, '{advanced_analytics}', 'true'::jsonb);
  END IF;

  IF sub_amount >= 15 THEN
    features := jsonb_set(features, '{automations_limit}', '999'::jsonb);
  END IF;

  IF sub_amount >= 16 THEN
    features := jsonb_set(features, '{custom_automation}', 'true'::jsonb);
  END IF;

  -- Tier 5: $17-20 - Enterprise Features
  IF sub_amount >= 17 THEN
    features := jsonb_set(features, '{api_access}', 'true'::jsonb);
  END IF;

  IF sub_amount >= 18 THEN
    features := jsonb_set(features, '{white_label}', 'true'::jsonb);
  END IF;

  IF sub_amount >= 20 THEN
    features := jsonb_set(features, '{enterprise_features}', 'true'::jsonb);
  END IF;

  RETURN features;
END;
$function$;