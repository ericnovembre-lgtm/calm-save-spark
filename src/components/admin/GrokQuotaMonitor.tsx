import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, XCircle, DollarSign, Clock, MessageSquare, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGrokQuotaStatus, AdaptiveStrategy, CircuitState } from '@/hooks/useGrokQuotaStatus';
import { cn } from '@/lib/utils';

const strategyConfig: Record<AdaptiveStrategy, { label: string; color: string; description: string }> = {
  aggressive: {
    label: 'Aggressive',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'High quota available, operating at full speed',
  },
  moderate: {
    label: 'Moderate',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    description: 'Normal operation with light throttling',
  },
  conservative: {
    label: 'Conservative',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'Heavy throttling to preserve quota',
  },
  critical: {
    label: 'Critical',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    description: 'Maximum throttling, quota nearly exhausted',
  },
};

const circuitConfig: Record<CircuitState, { icon: typeof CheckCircle; color: string; label: string }> = {
  closed: { icon: CheckCircle, color: 'text-emerald-400', label: 'Healthy' },
  'half-open': { icon: AlertTriangle, color: 'text-amber-400', label: 'Testing' },
  open: { icon: XCircle, color: 'text-rose-400', label: 'Open' },
};

// X/Grok brand icon component
function GrokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function GrokQuotaMonitor() {
  const { data: status, isLoading, error } = useGrokQuotaStatus();

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">Loading Grok status...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Failed to load Grok quota status
          </div>
        </CardContent>
      </Card>
    );
  }

  const strategyInfo = strategyConfig[status.strategy];
  const circuitInfo = circuitConfig[status.circuitState];
  const CircuitIcon = circuitInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GrokIcon className="w-4 h-4 text-foreground" />
              Grok (xAI) Quota
            </span>
            <Badge variant="outline" className={cn("text-xs", strategyInfo.color)}>
              {strategyInfo.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Circuit Breaker Status */}
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
            <span className="text-xs text-muted-foreground">Circuit Breaker</span>
            <div className="flex items-center gap-2">
              <CircuitIcon className={cn("w-4 h-4", circuitInfo.color)} />
              <span className={cn("text-xs font-medium", circuitInfo.color)}>
                {circuitInfo.label}
              </span>
            </div>
          </div>

          {/* Quota Gauges */}
          <div className="space-y-3">
            {/* Requests */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Requests/Min
                </span>
                <span className="font-mono text-foreground">
                  {status.requestsRemaining}/{status.requestsLimit}
                </span>
              </div>
              <Progress 
                value={status.requestsUsagePercent} 
                className={cn(
                  "h-2",
                  status.requestsUsagePercent > 80 ? "[&>div]:bg-rose-500" :
                  status.requestsUsagePercent > 50 ? "[&>div]:bg-amber-500" :
                  "[&>div]:bg-gray-500"
                )}
              />
            </div>

            {/* Tokens */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Tokens/Min
                </span>
                <span className="font-mono text-foreground">
                  {(status.tokensRemaining / 1000).toFixed(0)}K/{(status.tokensLimit / 1000).toFixed(0)}K
                </span>
              </div>
              <Progress 
                value={status.tokensUsagePercent} 
                className={cn(
                  "h-2",
                  status.tokensUsagePercent > 80 ? "[&>div]:bg-rose-500" :
                  status.tokensUsagePercent > 50 ? "[&>div]:bg-amber-500" :
                  "[&>div]:bg-gray-500"
                )}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Sentiment Queries */}
            <div className="p-2 bg-muted/20 rounded">
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <MessageSquare className="w-3 h-3" />
                Sentiment Queries
              </div>
              <div className="text-sm font-mono font-bold text-foreground">
                {status.sentimentQueriesCount.toLocaleString()}
              </div>
            </div>

            {/* Avg Latency */}
            <div className="p-2 bg-muted/20 rounded">
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3" />
                Avg Latency
              </div>
              <div className={cn(
                "text-sm font-mono font-bold",
                status.avgLatency > 2000 ? "text-rose-400" :
                status.avgLatency > 1000 ? "text-amber-400" :
                "text-foreground"
              )}>
                {status.avgLatency}ms
              </div>
            </div>

            {/* Cost Estimate */}
            <div className="p-2 bg-muted/20 rounded">
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <DollarSign className="w-3 h-3" />
                Total Cost
              </div>
              <div className="text-sm font-mono font-bold text-emerald-400">
                ${status.totalCostEstimate.toFixed(2)}
              </div>
            </div>

            {/* Failures */}
            <div className="p-2 bg-muted/20 rounded">
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3 h-3" />
                Failures
              </div>
              <div className={cn(
                "text-sm font-mono font-bold",
                status.consecutiveFailures > 0 ? "text-rose-400" : "text-foreground"
              )}>
                {status.consecutiveFailures}
              </div>
            </div>
          </div>

          {/* Strategy Description */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
            {strategyInfo.description}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
