import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Anomaly {
  id: string;
  type: 'spike' | 'unusual' | 'recurring';
  category: string;
  amount: number;
  baseline: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export function AnomalyDetector() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([
    {
      id: '1',
      type: 'spike',
      category: 'Dining',
      amount: 450,
      baseline: 150,
      severity: 'high',
      description: '3x your normal dining spending this week'
    },
    {
      id: '2',
      type: 'unusual',
      category: 'Shopping',
      amount: 890,
      baseline: 200,
      severity: 'medium',
      description: 'Large purchase detected at unusual time'
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  };

  const dismissAnomaly = (id: string) => {
    setAnomalies(prev => prev.filter(a => a.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <AlertTriangle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Anomaly Detection</h3>
            <p className="text-sm text-muted-foreground">AI-powered pattern recognition</p>
          </div>
        </div>
        {anomalies.length > 0 && (
          <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <span className="text-sm font-medium text-red-500">{anomalies.length} alerts</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {anomalies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-foreground font-medium mb-2">All Clear!</p>
            <p className="text-sm text-muted-foreground">No anomalies detected in your spending patterns</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anomaly) => (
              <motion.div
                key={anomaly.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`border rounded-2xl p-4 ${getSeverityColor(anomaly.severity)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground capitalize">{anomaly.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dismissAnomaly(anomaly.id)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-bold text-foreground">${anomaly.amount}</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Baseline</p>
                    <p className="font-medium text-foreground">${anomaly.baseline}</p>
                  </div>
                  <div className="ml-auto">
                    <p className="text-muted-foreground">Deviation</p>
                    <p className="font-bold text-red-500">
                      +{Math.round((anomaly.amount / anomaly.baseline - 1) * 100)}%
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-current/10">
                  <div className="h-2 bg-current/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((anomaly.amount / (anomaly.baseline * 3)) * 100, 100)}%` }}
                      className="h-full bg-current"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="mt-6 p-4 bg-accent/50 rounded-2xl">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">AI Analysis:</span> Our machine learning model
          continuously monitors your spending patterns to detect unusual activity and help you stay on track.
        </p>
      </div>
    </motion.div>
  );
}
