import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface NotificationPrefs {
  email_notifications: boolean;
  push_notifications: boolean;
  goal_reminders: boolean;
  transfer_alerts: boolean;
  budget_alerts: boolean;
  weekly_summary: boolean;
  marketing_emails: boolean;
}

export function NotificationPreferences() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPrefs>({
    email_notifications: true,
    push_notifications: false,
    goal_reminders: true,
    transfer_alerts: true,
    budget_alerts: true,
    weekly_summary: true,
    marketing_emails: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          goal_reminders: data.goal_reminders,
          transfer_alerts: data.transfer_alerts,
          budget_alerts: data.budget_alerts,
          weekly_summary: data.weekly_summary,
          marketing_emails: data.marketing_emails,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPrefs, value: boolean) => {
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

      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved',
      });
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update preferences',
        variant: 'destructive',
      });
      // Revert on error
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

  return (
    <div className="space-y-6">
      {/* Main Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications" className="text-base font-medium">
              Email Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={preferences.email_notifications}
            onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
            disabled={saving}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications" className="text-base font-medium">
              Push Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications in your browser
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={preferences.push_notifications}
            onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
            disabled={saving}
          />
        </div>
      </div>

      <Separator />

      {/* Specific Notification Types */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground">Notification Types</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="goal-reminders" className="text-sm font-medium">
              Goal Reminders
            </Label>
            <p className="text-sm text-muted-foreground">
              Get reminders about your savings goals
            </p>
          </div>
          <Switch
            id="goal-reminders"
            checked={preferences.goal_reminders}
            onCheckedChange={(checked) => updatePreference('goal_reminders', checked)}
            disabled={saving || !preferences.email_notifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="transfer-alerts" className="text-sm font-medium">
              Transfer Alerts
            </Label>
            <p className="text-sm text-muted-foreground">
              Notifications for scheduled and completed transfers
            </p>
          </div>
          <Switch
            id="transfer-alerts"
            checked={preferences.transfer_alerts}
            onCheckedChange={(checked) => updatePreference('transfer_alerts', checked)}
            disabled={saving || !preferences.email_notifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="budget-alerts" className="text-sm font-medium">
              Budget Alerts
            </Label>
            <p className="text-sm text-muted-foreground">
              Alerts when you're close to your budget limits
            </p>
          </div>
          <Switch
            id="budget-alerts"
            checked={preferences.budget_alerts}
            onCheckedChange={(checked) => updatePreference('budget_alerts', checked)}
            disabled={saving || !preferences.email_notifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="weekly-summary" className="text-sm font-medium">
              Weekly Summary
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive a weekly summary of your financial activity
            </p>
          </div>
          <Switch
            id="weekly-summary"
            checked={preferences.weekly_summary}
            onCheckedChange={(checked) => updatePreference('weekly_summary', checked)}
            disabled={saving || !preferences.email_notifications}
          />
        </div>
      </div>

      <Separator />

      {/* Marketing */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground">Marketing</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing-emails" className="text-sm font-medium">
              Marketing Emails
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive tips, updates, and promotional content
            </p>
          </div>
          <Switch
            id="marketing-emails"
            checked={preferences.marketing_emails}
            onCheckedChange={(checked) => updatePreference('marketing_emails', checked)}
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
}
