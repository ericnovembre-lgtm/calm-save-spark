import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, History } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export function RefinancingHistory() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['refinancing-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('refinancing_opportunities')
        .select('*')
        .in('status', ['approved', 'rejected', 'executed', 'expired'])
        .order('detected_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="p-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card className="p-12 text-center space-y-4">
        <History className="w-12 h-12 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">No History Yet</h3>
          <p className="text-muted-foreground mt-2">
            Your refinancing history will appear here once you start reviewing opportunities.
          </p>
        </div>
      </Card>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      executed: { icon: CheckCircle2, label: 'Executed', className: 'bg-green-500/10 text-green-600' },
      approved: { icon: Clock, label: 'Approved', className: 'bg-blue-500/10 text-blue-600' },
      rejected: { icon: XCircle, label: 'Rejected', className: 'bg-gray-500/10 text-gray-600' },
      expired: { icon: XCircle, label: 'Expired', className: 'bg-red-500/10 text-red-600' },
    };
    return configs[status as keyof typeof configs] || configs.expired;
  };

  return (
    <div className="space-y-4">
      {history.map((item) => {
        const statusConfig = getStatusConfig(item.status);
        const StatusIcon = statusConfig.icon;
        const savings = Number(item.net_savings);

        return (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold capitalize">{item.loan_type}</h4>
                  <Badge className={statusConfig.className}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-3 mt-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rate Change</p>
                    <p className="font-semibold">
                      {(Number(item.current_rate) * 100).toFixed(2)}% → {(Number(item.available_rate) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Net Savings</p>
                    <p className="font-semibold text-green-600">${savings.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Detected</p>
                    <p className="font-semibold">
                      {new Date(item.detected_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-sm text-muted-foreground mt-3 italic">{item.notes}</p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
