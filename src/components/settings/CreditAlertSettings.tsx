import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, TrendingUp } from "lucide-react";

export function CreditAlertSettings() {
  const [enabled, setEnabled] = useState(true);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("credit_alerts, credit_score_alert_threshold")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setEnabled(data.credit_alerts ?? true);
        setThreshold(data.credit_score_alert_threshold ?? 10);
      }
    } catch (error) {
      console.error("Error loading credit alert preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (field: string, value: boolean | number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          [field]: value,
        });

      if (error) throw error;
      toast.success("Credit alert settings updated");
    } catch (error) {
      console.error("Error updating credit alert preferences:", error);
      toast.error("Failed to update settings");
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Credit Score Alerts</h3>
          <p className="text-sm text-muted-foreground">
            Get notified when your score changes significantly
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="credit-alerts">Enable Credit Alerts</Label>
            <div className="text-sm text-muted-foreground">
              Receive email and push notifications for score changes
            </div>
          </div>
          <Switch
            id="credit-alerts"
            checked={enabled}
            onCheckedChange={(checked) => {
              setEnabled(checked);
              updatePreference("credit_alerts", checked);
            }}
          />
        </div>

        {enabled && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="threshold">Alert Threshold</Label>
                <span className="text-sm font-medium text-primary">±{threshold} points</span>
              </div>
              <Slider
                id="threshold"
                min={5}
                max={50}
                step={5}
                value={[threshold]}
                onValueChange={([value]) => setThreshold(value)}
                onValueCommit={([value]) => updatePreference("credit_score_alert_threshold", value)}
                className="py-4"
              />
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  You'll be notified when your credit score increases or decreases by {threshold} or
                  more points
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="text-sm font-medium">You'll receive alerts for:</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Significant score increases (+{threshold} points)</li>
                <li>• Significant score decreases (-{threshold} points)</li>
                <li>• Credit tier milestones (e.g., reaching "Very Good")</li>
                <li>• Credit goal achievements</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
