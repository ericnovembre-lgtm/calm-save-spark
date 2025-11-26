import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnomalyAlerts } from "@/hooks/useAnomalyAlerts";

const severityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
  critical: "bg-destructive text-destructive-foreground"
};

const severityIcons = {
  low: TrendingUp,
  medium: AlertTriangle,
  high: TrendingDown,
  critical: AlertTriangle
};

export function AnomalyAlertCenter() {
  const { anomalies, isLoading, scanForAnomalies, resolveAnomaly, summary } = useAnomalyAlerts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!anomalies || anomalies.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
        <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          No unusual financial patterns detected
        </p>
        <Button
          onClick={() => scanForAnomalies.mutate()}
          disabled={scanForAnomalies.isPending}
        >
          Scan for Anomalies
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Anomaly Detection</h2>
            <p className="text-sm text-muted-foreground">
              {summary.total} alert{summary.total !== 1 ? 's' : ''} requiring attention
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => scanForAnomalies.mutate()}
          disabled={scanForAnomalies.isPending}
        >
          Rescan
        </Button>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 flex-wrap">
        {summary.critical > 0 && (
          <Badge variant="destructive">
            {summary.critical} Critical
          </Badge>
        )}
        {summary.high > 0 && (
          <Badge className="bg-destructive/10 text-destructive">
            {summary.high} High
          </Badge>
        )}
        {summary.medium > 0 && (
          <Badge className="bg-warning/10 text-warning">
            {summary.medium} Medium
          </Badge>
        )}
        {summary.low > 0 && (
          <Badge variant="outline">
            {summary.low} Low
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {anomalies.map((anomaly, index) => {
          const Icon = severityIcons[anomaly.severity];
          
          return (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${severityColors[anomaly.severity]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold capitalize">
                          {anomaly.anomaly_type.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Detected {new Date(anomaly.detected_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={severityColors[anomaly.severity]}>
                        {anomaly.severity}
                      </Badge>
                    </div>

                    {anomaly.factors && anomaly.factors.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {anomaly.factors.map((factor, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium">{factor.type}:</span>{' '}
                            <span className="text-muted-foreground">{factor.description}</span>
                            {factor.deviation && (
                              <span className="ml-2 text-xs text-warning">
                                ({(factor.deviation * 100).toFixed(1)}% deviation)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAnomaly.mutate({
                          anomalyId: anomaly.id,
                          resolutionType: 'acknowledged',
                        })}
                        disabled={resolveAnomaly.isPending}
                        className="gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resolveAnomaly.mutate({
                          anomalyId: anomaly.id,
                          resolutionType: 'false_positive',
                          falsePositive: true,
                        })}
                        disabled={resolveAnomaly.isPending}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        False Alarm
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
