import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnomalyAlerts } from '@/hooks/useAnomalyAlerts';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function AnomalyAlertCenter() {
  const { anomalies, isLoading, scanForAnomalies, resolveAnomaly, summary } = useAnomalyAlerts();
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5" />;
      case 'high':
        return <AlertCircle className="h-5 w-5" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5" />;
      case 'low':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const handleResolve = async (anomalyId: string, resolutionType: 'dismissed' | 'actioned') => {
    setResolvingId(anomalyId);
    await resolveAnomaly.mutateAsync({
      anomalyId,
      resolutionType,
      falsePositive: resolutionType === 'dismissed',
    });
    setResolvingId(null);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-1">Anomaly Detection</h3>
          <p className="text-sm text-muted-foreground">
            Multi-factor intelligence monitoring
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => scanForAnomalies.mutate()}
          disabled={scanForAnomalies.isPending}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${scanForAnomalies.isPending ? 'animate-spin' : ''}`}
          />
          Scan
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-red-50 dark:bg-red-950/20">
          <div className="text-2xl font-bold text-red-600">{summary.critical}</div>
          <div className="text-xs text-muted-foreground">Critical</div>
        </Card>
        <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
          <div className="text-2xl font-bold text-orange-600">{summary.high}</div>
          <div className="text-xs text-muted-foreground">High</div>
        </Card>
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/20">
          <div className="text-2xl font-bold text-yellow-600">{summary.medium}</div>
          <div className="text-xs text-muted-foreground">Medium</div>
        </Card>
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/20">
          <div className="text-2xl font-bold text-amber-600">{summary.low}</div>
          <div className="text-xs text-muted-foreground">Low</div>
        </Card>
      </div>

      {/* Anomaly List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : anomalies && anomalies.length > 0 ? (
        <div className="space-y-3">
          {anomalies.map((anomaly, index) => (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        anomaly.severity === 'critical' || anomaly.severity === 'high'
                          ? 'bg-red-100 text-red-600 dark:bg-red-950/30'
                          : anomaly.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950/30'
                          : 'bg-amber-100 text-amber-600 dark:bg-amber-950/30'
                      }`}
                    >
                      {getSeverityIcon(anomaly.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium capitalize">
                          {anomaly.anomaly_type.replace(/_/g, ' ')}
                        </h4>
                        <Badge variant={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {anomaly.factors.map((factor, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            • {factor.description}
                          </p>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Detected {new Date(anomaly.detected_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolve(anomaly.id, 'actioned')}
                      disabled={resolvingId === anomaly.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolved
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResolve(anomaly.id, 'dismissed')}
                      disabled={resolvingId === anomaly.id}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
          <p className="font-medium">All Clear!</p>
          <p className="text-sm mt-1">No anomalies detected in your financial activity.</p>
        </div>
      )}
    </Card>
  );
}