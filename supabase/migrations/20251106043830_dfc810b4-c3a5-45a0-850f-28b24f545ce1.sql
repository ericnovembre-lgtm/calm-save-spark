-- Fix search_path security warning for database functions
-- This adds explicit search_path to prevent search path hijacking attacks

-- Fix compute_user_features function
CREATE OR REPLACE FUNCTION public.compute_user_features(sub_amount numeric)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  features jsonb := '{
    "goals_limit": 3,
    "pots_limit": 2,
    "automations_limit": 1,
    "ai_insights": false,
    "advanced_analytics": false,
    "priority_support": false
  }'::jsonb;
BEGIN
  IF sub_amount >= 29.99 THEN
    features := jsonb_set(features, '{goals_limit}', '999'::jsonb);
    features := jsonb_set(features, '{pots_limit}', '999'::jsonb);
    features := jsonb_set(features, '{automations_limit}', '999'::jsonb);
    features := jsonb_set(features, '{ai_insights}', 'true'::jsonb);
    features := jsonb_set(features, '{advanced_analytics}', 'true'::jsonb);
    features := jsonb_set(features, '{priority_support}', 'true'::jsonb);
  ELSIF sub_amount >= 14.99 THEN
    features := jsonb_set(features, '{goals_limit}', '20'::jsonb);
    features := jsonb_set(features, '{pots_limit}', '10'::jsonb);
    features := jsonb_set(features, '{automations_limit}', '10'::jsonb);
    features := jsonb_set(features, '{ai_insights}', 'true'::jsonb);
    features := jsonb_set(features, '{advanced_analytics}', 'true'::jsonb);
  ELSIF sub_amount >= 7.99 THEN
    features := jsonb_set(features, '{goals_limit}', '10'::jsonb);
    features := jsonb_set(features, '{pots_limit}', '5'::jsonb);
    features := jsonb_set(features, '{automations_limit}', '5'::jsonb);
    features := jsonb_set(features, '{ai_insights}', 'true'::jsonb);
  END IF;

  RETURN features;
END;
$$;

-- Fix log_subscription_change trigger function
CREATE OR REPLACE FUNCTION public.log_subscription_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscription_analytics (
    user_id,
    event_type,
    plan_name,
    amount,
    metadata
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    CASE
      WHEN TG_OP = 'INSERT' THEN 'subscription_created'
      WHEN TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN 
        CASE NEW.status
          WHEN 'active' THEN 'subscription_activated'
          WHEN 'canceled' THEN 'subscription_canceled'
          WHEN 'paused' THEN 'subscription_paused'
          ELSE 'subscription_updated'
        END
      WHEN TG_OP = 'DELETE' THEN 'subscription_deleted'
      ELSE 'subscription_updated'
    END,
    COALESCE(NEW.plan_name, OLD.plan_name),
    COALESCE(NEW.amount, OLD.amount),
    jsonb_build_object(
      'old_status', OLD.status,
      'new_status', NEW.status,
      'stripe_subscription_id', COALESCE(NEW.stripe_subscription_id, OLD.stripe_subscription_id)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;