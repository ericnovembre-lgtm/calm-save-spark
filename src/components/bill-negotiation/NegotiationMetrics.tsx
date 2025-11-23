import { TrendingUp, Target, DollarSign, Award } from "lucide-react";
import { TacticalCard } from "./TacticalCard";

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
      <TacticalCard glowColor="emerald">
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Lifetime Savings
            </span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            ${lifetimeSavings.toFixed(0)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            ${totalSavings.toFixed(0)}/mo sustained
          </div>
        </div>
      </TacticalCard>

      <TacticalCard glowColor="cyan">
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-cyan-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Success Rate
            </span>
          </div>
          <div className="text-3xl font-bold text-cyan-400">
            {successRate.toFixed(0)}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {completedRequests.length} of {requests.length} negotiations
          </div>
        </div>
      </TacticalCard>

      <TacticalCard glowColor="cyan">
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Avg Savings
            </span>
          </div>
          <div className="text-3xl font-bold text-cyan-400">
            ${avgSavings.toFixed(0)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            per negotiation
          </div>
        </div>
      </TacticalCard>

      <TacticalCard glowColor="amber" hasAlert={bestWin.savings > 0}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Best Win
            </span>
          </div>
          <div className="text-3xl font-bold text-amber-400">
            ${bestWin.savings.toFixed(0)}
          </div>
          <div className="text-sm text-muted-foreground mt-1 truncate">
            {bestWin.merchant || 'No wins yet'}
          </div>
        </div>
      </TacticalCard>
    </div>
  );
}