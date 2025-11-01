-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  subscription_amount numeric NOT NULL DEFAULT 0 CHECK (subscription_amount >= 0 AND subscription_amount <= 15),
  billing_interval text NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'annual')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  trial_end_date timestamptz,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_history table for audit trail
CREATE TABLE public.subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  previous_amount numeric,
  new_amount numeric NOT NULL,
  change_reason text,
  changed_at timestamptz DEFAULT now()
);

-- Create feature_access table for cached feature flags
CREATE TABLE public.feature_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  features jsonb NOT NULL DEFAULT '{}',
  computed_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_access ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for subscription_history
CREATE POLICY "Users can view own history"
  ON public.subscription_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all history"
  ON public.subscription_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for feature_access
CREATE POLICY "Users can view own features"
  ON public.feature_access FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all features"
  ON public.feature_access FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to compute features based on subscription amount
CREATE OR REPLACE FUNCTION public.compute_user_features(sub_amount numeric)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  features jsonb := '{
    "max_goals": 3,
    "max_pots": 5,
    "max_automation_rules": 0,
    "apy_rate": 3.5,
    "has_advanced_automation": false,
    "has_ai_insights": false,
    "has_saveplus_card": false,
    "has_priority_support": false,
    "has_analytics": false,
    "has_export": false,
    "cashback_rate": 0,
    "ai_chat_limit": 0,
    "has_physical_card": false,
    "has_phone_support": false,
    "has_api_access": false
  }'::jsonb;
BEGIN
  -- $1+
  IF sub_amount >= 1 THEN
    features := features || '{"max_goals": 5, "apy_rate": 3.75}'::jsonb;
  END IF;
  
  -- $2+
  IF sub_amount >= 2 THEN
    features := features || '{"max_pots": 10, "has_analytics": true}'::jsonb;
  END IF;
  
  -- $3+
  IF sub_amount >= 3 THEN
    features := features || '{"max_goals": 7, "max_automation_rules": 2}'::jsonb;
  END IF;
  
  -- $4+
  IF sub_amount >= 4 THEN
    features := features || '{"apy_rate": 4.0, "has_export": true}'::jsonb;
  END IF;
  
  -- $5+
  IF sub_amount >= 5 THEN
    features := features || '{"max_goals": 10, "has_ai_insights": true}'::jsonb;
  END IF;
  
  -- $6+
  IF sub_amount >= 6 THEN
    features := features || '{"max_pots": 15}'::jsonb;
  END IF;
  
  -- $7+
  IF sub_amount >= 7 THEN
    features := features || '{"max_automation_rules": 5, "has_advanced_automation": true}'::jsonb;
  END IF;
  
  -- $8+
  IF sub_amount >= 8 THEN
    features := features || '{"has_priority_support": true}'::jsonb;
  END IF;
  
  -- $9+
  IF sub_amount >= 9 THEN
    features := features || '{"max_goals": 999, "apy_rate": 4.15}'::jsonb;
  END IF;
  
  -- $10+
  IF sub_amount >= 10 THEN
    features := features || '{"max_pots": 999, "ai_chat_limit": 10}'::jsonb;
  END IF;
  
  -- $11+
  IF sub_amount >= 11 THEN
    features := features || '{"has_saveplus_card": true, "cashback_rate": 1.0}'::jsonb;
  END IF;
  
  -- $12+
  IF sub_amount >= 12 THEN
    features := jsonb_set(features, '{has_ai_insights}', 'true');
  END IF;
  
  -- $13+
  IF sub_amount >= 13 THEN
    features := features || '{"has_physical_card": true, "cashback_rate": 1.5}'::jsonb;
  END IF;
  
  -- $14+
  IF sub_amount >= 14 THEN
    features := features || '{"has_phone_support": true}'::jsonb;
  END IF;
  
  -- $15
  IF sub_amount >= 15 THEN
    features := features || '{"apy_rate": 4.25, "ai_chat_limit": 999, "cashback_rate": 2.0, "has_api_access": true}'::jsonb;
  END IF;
  
  RETURN features;
END;
$$;

-- Trigger function to update feature_access when subscription changes
CREATE OR REPLACE FUNCTION public.update_feature_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.feature_access (user_id, features, computed_at, updated_at)
  VALUES (NEW.user_id, public.compute_user_features(NEW.subscription_amount), now(), now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    features = public.compute_user_features(NEW.subscription_amount),
    updated_at = now(),
    computed_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger on subscription changes
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE OF subscription_amount ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_feature_access();

-- Trigger function to log subscription changes
CREATE OR REPLACE FUNCTION public.log_subscription_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.subscription_amount != NEW.subscription_amount THEN
    INSERT INTO public.subscription_history (user_id, previous_amount, new_amount, change_reason)
    VALUES (NEW.user_id, OLD.subscription_amount, NEW.subscription_amount, 'User changed subscription amount');
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.subscription_history (user_id, previous_amount, new_amount, change_reason)
    VALUES (NEW.user_id, NULL, NEW.subscription_amount, 'Initial subscription created');
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to log subscription changes
CREATE TRIGGER on_subscription_amount_change
  AFTER INSERT OR UPDATE OF subscription_amount ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_subscription_change();

-- Initialize free tier for new users
CREATE OR REPLACE FUNCTION public.initialize_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, subscription_amount, status)
  VALUES (NEW.id, 0, 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to initialize subscription for new users
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_subscription();