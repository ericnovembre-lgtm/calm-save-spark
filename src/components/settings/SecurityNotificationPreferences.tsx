import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Shield, LogIn, MonitorX, AlertTriangle, Lock } from 'lucide-react';

interface SecurityNotificationPrefs {
  email_notifications: boolean;
  security_login_alerts: boolean;
  security_session_revoked: boolean;
  security_lockdown_alerts: boolean;
  security_suspicious_activity: boolean;
}

export function SecurityNotificationPreferences() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<SecurityNotificationPrefs>({
    email_notifications: true,
    security_login_alerts: true,
    security_session_revoked: true,
    security_lockdown_alerts: true,
    security_suspicious_activity: true,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('email_notifications, security_login_alerts, security_session_revoked, security_lockdown_alerts, security_suspicious_activity')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications ?? true,
          security_login_alerts: data.security_login_alerts ?? true,
          security_session_revoked: data.security_session_revoked ?? true,
          security_lockdown_alerts: data.security_lockdown_alerts ?? true,
          security_suspicious_activity: data.security_suspicious_activity ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading security preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof SecurityNotificationPrefs, value: boolean) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
        });

      if (error) throw error;

      toast.success('Security preferences updated');
    } catch (error: unknown) {
      console.error('Error updating preferences:', error);
      const message = error instanceof Error ? error.message : 'Failed to update preferences';
      toast.error(message);
      loadPreferences();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const masterEnabled = preferences.email_notifications;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security Alerts
        </CardTitle>
        <CardDescription>
          Get notified about important security events on your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master toggle notice */}
        {!masterEnabled && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            Email notifications are disabled. Enable them in General Notifications to receive security alerts.
          </div>
        )}

        <div className="space-y-4">
          {/* Login Alerts */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <LogIn className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="security-login" className="text-sm font-medium">
                  Login Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when someone logs into your account from a new device or location
                </p>
              </div>
            </div>
            <Switch
              id="security-login"
              checked={preferences.security_login_alerts}
              onCheckedChange={(checked) => updatePreference('security_login_alerts', checked)}
              disabled={saving || !masterEnabled}
            />
          </div>

          <Separator className="bg-border/50" />

          {/* Session Revoked */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <MonitorX className="h-4 w-4 text-amber-400" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="security-session" className="text-sm font-medium">
                  Session Revocation
                </Label>
                <p className="text-xs text-muted-foreground">
                  Alerts when a session is terminated or a connected app is disconnected
                </p>
              </div>
            </div>
            <Switch
              id="security-session"
              checked={preferences.security_session_revoked}
              onCheckedChange={(checked) => updatePreference('security_session_revoked', checked)}
              disabled={saving || !masterEnabled}
            />
          </div>

          <Separator className="bg-border/50" />

          {/* Lockdown Alerts */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <Lock className="h-4 w-4 text-rose-400" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="security-lockdown" className="text-sm font-medium">
                  Lockdown Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Notifications when emergency lockdown is activated or deactivated
                </p>
              </div>
            </div>
            <Switch
              id="security-lockdown"
              checked={preferences.security_lockdown_alerts}
              onCheckedChange={(checked) => updatePreference('security_lockdown_alerts', checked)}
              disabled={saving || !masterEnabled}
            />
          </div>

          <Separator className="bg-border/50" />

          {/* Suspicious Activity */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="security-suspicious" className="text-sm font-medium">
                  Suspicious Activity
                </Label>
                <p className="text-xs text-muted-foreground">
                  Critical alerts for blocked login attempts and security anomalies
                </p>
              </div>
            </div>
            <Switch
              id="security-suspicious"
              checked={preferences.security_suspicious_activity}
              onCheckedChange={(checked) => updatePreference('security_suspicious_activity', checked)}
              disabled={saving || !masterEnabled}
            />
          </div>
        </div>

        {/* Info box */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 mt-6">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> We recommend keeping all security alerts enabled. 
            Critical security events like suspicious login attempts are sent regardless of these settings to protect your account.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
