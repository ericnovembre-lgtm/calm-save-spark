-- Add security notification preference columns to notification_preferences table
ALTER TABLE public.notification_preferences
ADD COLUMN IF NOT EXISTS security_login_alerts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS security_session_revoked boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS security_lockdown_alerts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS security_suspicious_activity boolean DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.notification_preferences.security_login_alerts IS 'Email alerts for new login events';
COMMENT ON COLUMN public.notification_preferences.security_session_revoked IS 'Email alerts when sessions are revoked';
COMMENT ON COLUMN public.notification_preferences.security_lockdown_alerts IS 'Email alerts for lockdown activation/deactivation';
COMMENT ON COLUMN public.notification_preferences.security_suspicious_activity IS 'Email alerts for suspicious activity detected';