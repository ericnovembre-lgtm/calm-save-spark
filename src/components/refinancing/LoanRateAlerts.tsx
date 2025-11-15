import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

export function LoanRateAlerts() {
  const queryClient = useQueryClient();

  const { data: alerts } = useQuery({
    queryKey: ['loan-rate-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_rate_alerts')
        .select('*, debts(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const toggleAlert = useMutation({
    mutationFn: async ({ alertId, isActive }: { alertId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('loan_rate_alerts')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-rate-alerts'] });
      toast.success('Alert updated');
    },
  });

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="p-12 text-center space-y-4">
        <Bell className="w-12 h-12 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">No Rate Alerts Configured</h3>
          <p className="text-muted-foreground mt-2">
            Add your loans to automatically monitor for refinancing opportunities.
          </p>
          <Button className="mt-4">Add Loan</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const currentRate = Number(alert.current_rate) * 100;
        const threshold = Number(alert.alert_threshold) * 100;
        
        return (
          <Card key={alert.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold capitalize">{alert.loan_type}</h4>
                  {alert.is_active ? (
                    <Badge className="bg-green-500/10 text-green-600">
                      <Bell className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <BellOff className="w-3 h-3 mr-1" />
                      Paused
                    </Badge>
                  )}
                </div>
                {alert.debts && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {alert.debts.debt_name} - ${Number(alert.debts.current_balance).toLocaleString()}
                  </p>
                )}

                <div className="grid gap-3 md:grid-cols-2 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Rate</p>
                    <p className="text-xl font-bold">{currentRate.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Alert Threshold</p>
                    <p className="text-xl font-bold text-green-600">{threshold.toFixed(2)}%</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  You'll be notified when rates drop below {threshold.toFixed(2)}%
                </p>
              </div>

              <Switch
                checked={alert.is_active}
                onCheckedChange={(checked) =>
                  toggleAlert.mutate({ alertId: alert.id, isActive: checked })
                }
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
