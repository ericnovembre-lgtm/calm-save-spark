import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { TrendingUp, Bell, Activity, Mail } from "lucide-react";

interface AlertSettings {
  drift_threshold_percent: number;
  daily_portfolio_summary: boolean;
  price_alert_notifications: boolean;
  market_event_alerts: boolean;
  volatility_alerts: boolean;
  volatility_threshold_percent: number;
}

const defaultSettings: AlertSettings = {
  drift_threshold_percent: 5,
  daily_portfolio_summary: true,
  price_alert_notifications: true,
  market_event_alerts: true,
  volatility_alerts: true,
  volatility_threshold_percent: 10,
};

export function InvestmentAlertSettings() {
  const [settings, setSettings] = useState<AlertSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('investment_alert_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setSettings({
          drift_threshold_percent: data.drift_threshold_percent,
          daily_portfolio_summary: data.daily_portfolio_summary,
          price_alert_notifications: data.price_alert_notifications,
          market_event_alerts: data.market_event_alerts,
          volatility_alerts: data.volatility_alerts,
          volatility_threshold_percent: data.volatility_threshold_percent,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('investment_alert_settings')
        .upsert({
          user_id: user.id,
          ...settings,
        });

      if (error) throw error;

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-slate-800/30 border-slate-700">
        <div className="flex items-start gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="flex-1">
            <Label className="text-base font-semibold">Portfolio Drift Alerts</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Get notified when your portfolio allocation drifts beyond this threshold
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Drift Threshold</span>
            <span className="text-sm font-semibold">{settings.drift_threshold_percent}%</span>
          </div>
          <Slider
            value={[settings.drift_threshold_percent]}
            onValueChange={([value]) =>
              setSettings({ ...settings, drift_threshold_percent: value })
            }
            min={1}
            max={15}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Alert me when any asset class drifts more than {settings.drift_threshold_percent}% from target
          </p>
        </div>
      </Card>

      <Card className="p-4 bg-slate-800/30 border-slate-700">
        <div className="flex items-start gap-3 mb-4">
          <Activity className="h-5 w-5 text-orange-400 mt-0.5" />
          <div className="flex-1">
            <Label className="text-base font-semibold">Volatility Alerts</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Get notified about significant price movements
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="volatility-toggle" className="cursor-pointer">
              Enable volatility alerts
            </Label>
            <Switch
              id="volatility-toggle"
              checked={settings.volatility_alerts}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, volatility_alerts: checked })
              }
            />
          </div>
          {settings.volatility_alerts && (
            <div className="space-y-3 pl-4 border-l-2 border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Volatility Threshold</span>
                <span className="text-sm font-semibold">{settings.volatility_threshold_percent}%</span>
              </div>
              <Slider
                value={[settings.volatility_threshold_percent]}
                onValueChange={([value]) =>
                  setSettings({ ...settings, volatility_threshold_percent: value })
                }
                min={5}
                max={25}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Alert me when daily price change exceeds {settings.volatility_threshold_percent}%
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-slate-800/30 border-slate-700">
        <div className="flex items-start gap-3 mb-4">
          <Bell className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <Label className="text-base font-semibold">Notification Preferences</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Choose what types of alerts you want to receive
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="price-alerts" className="cursor-pointer">
              Price target notifications
            </Label>
            <Switch
              id="price-alerts"
              checked={settings.price_alert_notifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, price_alert_notifications: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="market-events" className="cursor-pointer">
              Market event alerts
            </Label>
            <Switch
              id="market-events"
              checked={settings.market_event_alerts}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, market_event_alerts: checked })
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-slate-800/30 border-slate-700">
        <div className="flex items-start gap-3 mb-4">
          <Mail className="h-5 w-5 text-green-400 mt-0.5" />
          <div className="flex-1">
            <Label className="text-base font-semibold">Daily Summary</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Receive a daily portfolio performance summary
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="daily-summary" className="cursor-pointer">
            Enable daily portfolio summary
          </Label>
          <Switch
            id="daily-summary"
            checked={settings.daily_portfolio_summary}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, daily_portfolio_summary: checked })
            }
          />
        </div>
      </Card>

      <Button
        onClick={saveSettings}
        disabled={isSaving}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isSaving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}
