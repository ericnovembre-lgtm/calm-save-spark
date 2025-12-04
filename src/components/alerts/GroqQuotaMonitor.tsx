import { motion } from 'framer-motion';
import { Activity, Zap, Shield, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGroqQuotaStatus, AdaptiveStrategy, CircuitState } from '@/hooks/useGroqQuotaStatus';
import { cn } from '@/lib/utils';

const strategyConfig: Record<AdaptiveStrategy, { label: string; color: string; icon: typeof Zap }> = {
  aggressive: { label: 'Aggressive', color: 'bg-emerald-500', icon: Zap },
  moderate: { label: 'Moderate', color: 'bg-amber-500', icon: Activity },
  conservative: { label: 'Conservative', color: 'bg-orange-500', icon: Clock },
  critical: { label: 'Critical', color: 'bg-rose-500', icon: AlertTriangle },
};

const circuitConfig: Record<CircuitState, { label: string; color: string }> = {
  closed: { label: 'Closed', color: 'text-emerald-400' },
  'half-open': { label: 'Half-Open', color: 'text-amber-400' },
  open: { label: 'Open', color: 'text-rose-400' },
};

interface QuotaGaugeProps {
  label: string;
  used: number;
  total: number;
  percentUsed: number;
}

function QuotaGauge({ label, used, total, percentUsed }: QuotaGaugeProps) {
  const remaining = total - used;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">
          {remaining.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <Progress 
        value={100 - percentUsed} 
        className="h-2"
      />
      <div className="text-xs text-muted-foreground text-right">
        {percentUsed}% used
      </div>
    </div>
  );
}

export function GroqQuotaMonitor() {
  const { data: quota, isLoading, error } = useGroqQuotaStatus();

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-2 bg-muted rounded" />
            <div className="h-2 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !quota) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 text-center text-muted-foreground">
          Unable to load quota status
        </CardContent>
      </Card>
    );
  }

  const strategy = strategyConfig[quota.strategy];
  const circuit = circuitConfig[quota.circuitState];
  const StrategyIcon = strategy.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Groq API Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn("text-xs", strategy.color, "text-white border-0")}
              >
                <StrategyIcon className="w-3 h-3 mr-1" />
                {strategy.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Circuit Breaker Status */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className={cn("w-4 h-4", circuit.color)} />
              <span className="text-sm text-muted-foreground">Circuit Breaker</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                quota.circuitState === 'closed' ? 'bg-emerald-400' :
                quota.circuitState === 'half-open' ? 'bg-amber-400 animate-pulse' :
                'bg-rose-400 animate-pulse'
              )} />
              <span className={cn("text-sm font-medium", circuit.color)}>
                {circuit.label}
              </span>
            </div>
          </div>

          {/* Quota Gauges */}
          <QuotaGauge
            label="Daily Requests"
            used={quota.requestsLimit - quota.requestsRemaining}
            total={quota.requestsLimit}
            percentUsed={quota.requestsPercentUsed}
          />
          
          <QuotaGauge
            label="Tokens/Minute"
            used={quota.tokensLimit - quota.tokensRemaining}
            total={quota.tokensLimit}
            percentUsed={quota.tokensPercentUsed}
          />

          {/* Latency & Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Clock className="w-3 h-3" />
                Avg Latency
              </div>
              <div className="font-mono text-lg text-foreground">
                {quota.avgLatency}ms
              </div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <TrendingUp className="w-3 h-3" />
                Failures
              </div>
              <div className={cn(
                "font-mono text-lg",
                quota.consecutiveFailures > 0 ? "text-amber-400" : "text-foreground"
              )}>
                {quota.consecutiveFailures}
              </div>
            </div>
          </div>

          {/* Warning for critical state */}
          {quota.strategy === 'critical' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-sm text-rose-400">
                API quota critically low. Requests are being throttled.
              </span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
