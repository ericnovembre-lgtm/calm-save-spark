-- Fix has_role function to include SET search_path for security
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_role boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = has_role.user_id 
    AND user_roles.role = role_name
  ) INTO has_role;
  
  RETURN has_role;
END;
$$;

-- Fix cleanup_old_monitoring_data to include SET search_path
CREATE OR REPLACE FUNCTION public.cleanup_old_monitoring_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM performance_metrics WHERE created_at < NOW() - INTERVAL '7 days';
  DELETE FROM slo_breaches WHERE created_at < NOW() - INTERVAL '7 days' AND resolved = true;
  DELETE FROM incident_logs WHERE created_at < NOW() - INTERVAL '7 days';
  DELETE FROM admin_notifications WHERE created_at < NOW() - INTERVAL '7 days' AND read = true;
END;
$$;

-- Fix update_push_subscription_updated_at to include SET search_path
CREATE OR REPLACE FUNCTION public.update_push_subscription_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;