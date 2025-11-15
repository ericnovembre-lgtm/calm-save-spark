-- Create function to check if user has admin role
CREATE OR REPLACE FUNCTION has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Performance metrics collected by Aegis
CREATE TABLE performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  threshold_value numeric,
  status text NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  metadata jsonb DEFAULT '{}'::jsonb,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- SLO breaches detected by Aegis
CREATE TABLE slo_breaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breach_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('warning', 'critical')),
  metric_name text NOT NULL,
  current_value numeric NOT NULL,
  threshold_value numeric NOT NULL,
  breach_duration_seconds integer,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Incident response actions by Hephaestus
CREATE TABLE incident_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breach_id uuid REFERENCES slo_breaches(id),
  action_type text NOT NULL,
  action_description text NOT NULL,
  ai_diagnosis text,
  fix_applied text,
  fix_successful boolean,
  execution_time_ms integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Admin notification center
CREATE TABLE admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  action_taken text,
  related_incident_id uuid REFERENCES incident_logs(id),
  read boolean DEFAULT false,
  read_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_performance_metrics_type_created ON performance_metrics(metric_type, created_at DESC);
CREATE INDEX idx_slo_breaches_resolved_created ON slo_breaches(resolved, created_at DESC);
CREATE INDEX idx_admin_notifications_read_created ON admin_notifications(read, created_at DESC);

-- Enable RLS
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE slo_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin-only access)
CREATE POLICY "Admin only access" ON performance_metrics FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin only access" ON slo_breaches FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin only access" ON incident_logs FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin only access" ON admin_notifications FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Cleanup function for 7-day retention
CREATE OR REPLACE FUNCTION cleanup_old_monitoring_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM performance_metrics WHERE created_at < NOW() - INTERVAL '7 days';
  DELETE FROM slo_breaches WHERE created_at < NOW() - INTERVAL '7 days' AND resolved = true;
  DELETE FROM incident_logs WHERE created_at < NOW() - INTERVAL '7 days';
  DELETE FROM admin_notifications WHERE created_at < NOW() - INTERVAL '7 days' AND read = true;
END;
$$;