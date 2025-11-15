-- Schedule Aegis monitoring every 5 minutes
SELECT cron.schedule(
  'aegis-monitoring',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://gmnpjgelzsmcidwrwbcg.supabase.co/functions/v1/aegis-monitor',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbnBqZ2VsenNtY2lkd3J3YmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODE0MTEsImV4cCI6MjA3NzI1NzQxMX0.x6_XHaj_xM-OpJvynD2O6TurM3nA9-7xcB3B0krC3sM"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule daily cleanup at 2 AM
SELECT cron.schedule(
  'cleanup-monitoring-data',
  '0 2 * * *',
  $$
  SELECT cleanup_old_monitoring_data();
  $$
);