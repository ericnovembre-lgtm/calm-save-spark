import { TrendingUp, Target, DollarSign, Award } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";

interface NegotiationMetricsProps {
  requests: any[];
}

export function NegotiationMetrics({ requests }: NegotiationMetricsProps) {
  const completedRequests = requests.filter(r => r.status === 'completed');
  
  const totalSavings = completedRequests.reduce((sum, r) => 
    sum + Number(r.actual_savings || 0), 0
  );
  
  const lifetimeSavings = totalSavings * 12; // Annualized
  
  const successRate = requests.length > 0 
    ? (completedRequests.length / requests.length) * 100 
    : 0;
  
  const avgSavings = completedRequests.length > 0
    ? totalSavings / completedRequests.length
    : 0;
  
  const bestWin = completedRequests.reduce((max, r) => {
    const savings = Number(r.actual_savings || 0);
    return savings > max.savings ? { savings, merchant: r.merchant } : max;
  }, { savings: 0, merchant: '' });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between mb-2">
          <DollarSign className="w-6 h-6 text-success" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Lifetime Savings
          </span>
        </div>
        <div className="text-3xl font-bold text-success">
          ${lifetimeSavings.toFixed(0)}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          ${totalSavings.toFixed(0)}/mo sustained
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Target className="w-6 h-6 text-foreground/60" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Success Rate
          </span>
        </div>
        <div className="text-3xl font-bold text-foreground">
          {successRate.toFixed(0)}%
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {completedRequests.length} of {requests.length} negotiations
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between mb-2">
          <TrendingUp className="w-6 h-6 text-accent" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Avg Savings
          </span>
        </div>
        <div className="text-3xl font-bold text-accent">
          ${avgSavings.toFixed(0)}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          per negotiation
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Award className="w-6 h-6 text-warning" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Best Win
          </span>
        </div>
        <div className="text-3xl font-bold text-warning">
          ${bestWin.savings.toFixed(0)}
        </div>
        <div className="text-sm text-muted-foreground mt-1 truncate">
          {bestWin.merchant || 'No wins yet'}
        </div>
      </GlassPanel>
    </div>
  );
}