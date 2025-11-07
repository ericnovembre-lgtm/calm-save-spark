-- Create subscription_analytics table for tracking subscription events
CREATE TABLE IF NOT EXISTS public.subscription_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  plan_name text,
  amount numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own analytics"
  ON public.subscription_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert analytics"
  ON public.subscription_analytics
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_subscription_analytics_user_id ON public.subscription_analytics(user_id);
CREATE INDEX idx_subscription_analytics_event_type ON public.subscription_analytics(event_type);
CREATE INDEX idx_subscription_analytics_created_at ON public.subscription_analytics(created_at DESC);

-- Update the log_subscription_change function to use correct column name
CREATE OR REPLACE FUNCTION public.log_subscription_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    NULL, -- plan_name (not currently stored in user_subscriptions)
    COALESCE(NEW.subscription_amount, OLD.subscription_amount),
    jsonb_build_object(
      'old_status', OLD.status,
      'new_status', NEW.status,
      'stripe_subscription_id', COALESCE(NEW.stripe_subscription_id, OLD.stripe_subscription_id)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create trigger on user_subscriptions if it doesn't exist
DROP TRIGGER IF EXISTS on_subscription_change ON public.user_subscriptions;
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE OR DELETE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_subscription_change();