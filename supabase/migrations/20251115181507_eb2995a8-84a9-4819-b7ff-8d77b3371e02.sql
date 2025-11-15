-- Phase 1 Emergency Performance Fixes

-- ============================================================================
-- 1. ADD CRITICAL DATABASE INDEXES
-- ============================================================================

-- Profiles table indexes (1,044 seq scans → index scans)
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Crypto holdings indexes (740 seq scans → index scans)
CREATE INDEX IF NOT EXISTS idx_crypto_holdings_symbol ON public.crypto_holdings(symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_holdings_user_symbol ON public.crypto_holdings(user_id, symbol);

-- ============================================================================
-- 2. FIX NOTIFICATION_QUEUE FOREIGN KEY ISSUE
-- ============================================================================

-- Drop old notification_queue table if exists and recreate with proper FK
DROP TABLE IF EXISTS public.notification_queue CASCADE;

CREATE TABLE public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  content JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON public.notification_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notification_queue FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update notifications"
  ON public.notification_queue FOR UPDATE
  USING (true);

-- Add index for performance
CREATE INDEX idx_notification_queue_status ON public.notification_queue(status) WHERE status = 'pending';
CREATE INDEX idx_notification_queue_user_id ON public.notification_queue(user_id);

-- ============================================================================
-- 3. CREATE ANALYTICS CLEANUP FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_analytics_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete analytics events older than 90 days
  DELETE FROM public.analytics_events
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  RAISE NOTICE 'Cleaned up old analytics events at %', NOW();
END;
$$;

-- ============================================================================
-- 4. UPDATE CRON JOB SCHEDULES WITH EARLY-EXIT CHECKS
-- ============================================================================

-- Update cleanup_expired_webauthn_challenges with early-exit check
CREATE OR REPLACE FUNCTION public.cleanup_expired_webauthn_challenges()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Check if there are any expired challenges first
  SELECT COUNT(*) INTO expired_count
  FROM public.webauthn_challenges
  WHERE expires_at < now()
  LIMIT 1;
  
  -- Early exit if no work to do
  IF expired_count = 0 THEN
    RETURN;
  END IF;
  
  -- Delete expired challenges
  DELETE FROM public.webauthn_challenges
  WHERE expires_at < now();
  
  RAISE NOTICE 'Cleaned up % expired WebAuthn challenges at %', expired_count, NOW();
END;
$$;

-- Update cleanup_old_monitoring_data with early-exit checks
CREATE OR REPLACE FUNCTION public.cleanup_old_monitoring_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  metrics_count INTEGER;
  breaches_count INTEGER;
  incidents_count INTEGER;
  notifications_count INTEGER;
BEGIN
  -- Check if there's any old data to clean up
  SELECT 
    (SELECT COUNT(*) FROM performance_metrics WHERE created_at < NOW() - INTERVAL '7 days' LIMIT 1),
    (SELECT COUNT(*) FROM slo_breaches WHERE created_at < NOW() - INTERVAL '7 days' AND resolved = true LIMIT 1),
    (SELECT COUNT(*) FROM incident_logs WHERE created_at < NOW() - INTERVAL '7 days' LIMIT 1),
    (SELECT COUNT(*) FROM admin_notifications WHERE created_at < NOW() - INTERVAL '7 days' AND read = true LIMIT 1)
  INTO metrics_count, breaches_count, incidents_count, notifications_count;
  
  -- Early exit if no work to do
  IF metrics_count = 0 AND breaches_count = 0 AND incidents_count = 0 AND notifications_count = 0 THEN
    RETURN;
  END IF;
  
  -- Perform cleanup
  DELETE FROM performance_metrics WHERE created_at < NOW() - INTERVAL '7 days';
  DELETE FROM slo_breaches WHERE created_at < NOW() - INTERVAL '7 days' AND resolved = true;
  DELETE FROM incident_logs WHERE created_at < NOW() - INTERVAL '7 days';
  DELETE FROM admin_notifications WHERE created_at < NOW() - INTERVAL '7 days' AND read = true;
  
  RAISE NOTICE 'Cleaned up monitoring data at %', NOW();
END;
$$;

-- ============================================================================
-- 5. SCHEDULE CRON JOBS WITH OPTIMIZED FREQUENCIES
-- ============================================================================

-- Remove old webauthn cleanup cron if it exists (was every 15 min)
SELECT cron.unschedule('cleanup-webauthn-challenges-15min') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-webauthn-challenges-15min'
);

-- Add webauthn cleanup cron - reduced from every 15 min to hourly
SELECT cron.schedule(
  'cleanup-webauthn-challenges-hourly',
  '0 * * * *',
  $$SELECT public.cleanup_expired_webauthn_challenges()$$
);

-- Add analytics cleanup cron - daily at 3 AM
SELECT cron.schedule(
  'cleanup-analytics-daily',
  '0 3 * * *',
  $$SELECT public.cleanup_old_analytics_events()$$
);

-- Comment: send-notification-email cron is intentionally not added yet
-- It will be re-enabled after the foreign key fix is confirmed working