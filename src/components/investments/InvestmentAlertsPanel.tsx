import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Plus, TrendingUp, TrendingDown, AlertCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { PriceAlertModal } from "./PriceAlertModal";
import { InvestmentAlertSettings } from "./InvestmentAlertSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PriceAlert {
  id: string;
  symbol: string;
  asset_name: string | null;
  alert_type: 'above' | 'below' | 'percent_change';
  target_price: number | null;
  percent_threshold: number | null;
  current_price_at_creation: number | null;
  is_triggered: boolean;
  triggered_at: string | null;
  is_active: boolean;
  created_at: string;
  note: string | null;
}

export function InvestmentAlertsPanel() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "triggered" | "settings">("active");

  useEffect(() => {
    fetchAlerts();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('investment_alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'investment_price_alerts',
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('investment_price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts((data || []) as PriceAlert[]);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('investment_price_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
      toast.success('Alert deleted');
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('investment_price_alerts')
        .update({ is_active: !isActive })
        .eq('id', alertId);

      if (error) throw error;
      toast.success(isActive ? 'Alert paused' : 'Alert activated');
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast.error('Failed to update alert');
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'above':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'below':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'percent_change':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatAlertDescription = (alert: PriceAlert) => {
    if (alert.alert_type === 'above') {
      return `Alert when price goes above $${alert.target_price?.toFixed(2)}`;
    } else if (alert.alert_type === 'below') {
      return `Alert when price goes below $${alert.target_price?.toFixed(2)}`;
    } else if (alert.alert_type === 'percent_change') {
      return `Alert on ${alert.percent_threshold}% price change`;
    }
    return '';
  };

  const activeAlerts = alerts.filter(a => a.is_active && !a.is_triggered);
  const triggeredAlerts = alerts.filter(a => a.is_triggered);

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Bell className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Investment Alerts</h3>
              <p className="text-sm text-muted-foreground">
                {activeAlerts.length} active • {triggeredAlerts.length} triggered
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Alert
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="active">Active ({activeAlerts.length})</TabsTrigger>
            <TabsTrigger value="triggered">Triggered ({triggeredAlerts.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
              ) : activeAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No active alerts</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create price alerts to get notified when assets hit your targets
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <Card key={alert.id} className="p-4 bg-slate-800/30 border-slate-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getAlertIcon(alert.alert_type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground">
                                {alert.asset_name || alert.symbol}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {alert.symbol}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatAlertDescription(alert)}
                            </p>
                            {alert.note && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                Note: {alert.note}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleAlert(alert.id, alert.is_active)}
                          >
                            {alert.is_active ? 'Pause' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteAlert(alert.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="triggered" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {triggeredAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <Check className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No triggered alerts</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You'll see alerts here when they're triggered
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {triggeredAlerts.map((alert) => (
                    <Card key={alert.id} className="p-4 bg-green-500/5 border-green-500/20">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground">
                                {alert.asset_name || alert.symbol}
                              </span>
                              <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                                Triggered
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatAlertDescription(alert)}
                            </p>
                            {alert.triggered_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Triggered {new Date(alert.triggered_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <InvestmentAlertSettings />
          </TabsContent>
        </Tabs>
      </div>

      <PriceAlertModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onAlertCreated={fetchAlerts}
      />
    </Card>
  );
}
