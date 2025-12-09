import { useBatchProcessingStats } from "@/hooks/useBatchProcessingStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Clock, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function BatchProcessingMonitor() {
  const { data: stats, isLoading } = useBatchProcessingStats();

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const statusConfig = {
    idle: { label: 'Idle', color: 'bg-muted text-muted-foreground' },
    processing: { label: 'Processing', color: 'bg-primary/20 text-primary' },
    high_volume: { label: 'High Volume', color: 'bg-amber-500/20 text-amber-500' },
    throttled: { label: 'Throttled', color: 'bg-destructive/20 text-destructive' }
  };

  const currentStatus = statusConfig[stats.status];

  return (
    <Card className="border-amber-500/20 bg-stone-900/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-400" />
            Batch Processing Monitor
          </CardTitle>
          <Badge variant="outline" className={cn("text-xs", currentStatus.color)}>
            {currentStatus.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Queue Depth */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              Queue Depth
            </div>
            <div className={cn(
              "text-2xl font-bold font-mono",
              stats.queueDepth > 20 ? "text-amber-400" : "text-foreground"
            )}>
              {stats.queueDepth}
            </div>
          </div>

          {/* Throughput */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Throughput
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {stats.throughput}<span className="text-xs text-muted-foreground">/min</span>
            </div>
          </div>

          {/* Groq Latency */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Groq Latency
            </div>
            <div className={cn(
              "text-2xl font-bold font-mono",
              stats.avgGroqLatency > 500 ? "text-amber-400" : "text-yellow-400"
            )}>
              {stats.avgGroqLatency}<span className="text-xs text-muted-foreground">ms</span>
            </div>
          </div>

          {/* Efficiency */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              Efficiency
            </div>
            <div className="text-2xl font-bold font-mono text-yellow-400">
              {stats.efficiency}<span className="text-xs text-muted-foreground">tx/call</span>
            </div>
          </div>
        </div>

        {/* Secondary stats */}
        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Recent Batches:</span>
            <span className="ml-1 font-mono">{stats.recentBatches}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Batch Time:</span>
            <span className="ml-1 font-mono">{stats.avgBatchLatency}ms</span>
          </div>
          <div>
            <span className="text-muted-foreground">Anomaly Rate:</span>
            <span className={cn(
              "ml-1 font-mono",
              stats.anomalyRate > 10 ? "text-amber-400" : "text-muted-foreground"
            )}>
              {stats.anomalyRate}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
