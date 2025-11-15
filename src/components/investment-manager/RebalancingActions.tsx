import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scale, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface RebalancingActionsProps {
  mandate: any;
}

export function RebalancingActions({ mandate }: RebalancingActionsProps) {
  const { data: actions } = useQuery({
    queryKey: ['rebalancing-actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rebalancing_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { icon: Clock, label: 'Pending', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
      executed: { icon: CheckCircle2, label: 'Executed', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
      failed: { icon: XCircle, label: 'Failed', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
      cancelled: { icon: XCircle, label: 'Cancelled', className: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  if (!mandate) {
    return (
      <Card className="p-12 text-center space-y-4">
        <Scale className="w-12 h-12 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">Configure Investment Mandate</h3>
          <p className="text-muted-foreground mt-2">
            Set up your target allocation and rebalancing preferences to enable automatic portfolio management.
          </p>
          <Button className="mt-4">Configure Settings</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Mandate</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Risk Tolerance</p>
            <p className="font-semibold capitalize">{mandate.risk_tolerance}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rebalancing Threshold</p>
            <p className="font-semibold">{Number(mandate.rebalancing_threshold)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Auto-Rebalance</p>
            <Badge variant={mandate.auto_rebalance_enabled ? 'default' : 'outline'}>
              {mandate.auto_rebalance_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tax-Loss Harvesting</p>
            <Badge variant={mandate.tax_loss_harvest_enabled ? 'default' : 'outline'}>
              {mandate.tax_loss_harvest_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Rebalancing History</h3>
        {!actions || actions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No rebalancing actions yet</p>
        ) : (
          <div className="space-y-3">
            {actions.map((action) => {
              const statusConfig = getStatusBadge(action.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={action.id} className="p-4 bg-accent/30 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold capitalize">{action.action_type}</span>
                        <span className="font-mono text-sm">{action.symbol}</span>
                        <Badge className={statusConfig.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>Quantity: {Number(action.quantity)} @ ${Number(action.price).toFixed(2)}</p>
                        <p>Total Value: ${Number(action.total_value).toLocaleString()}</p>
                        <p>Reason: {action.reason}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(action.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
