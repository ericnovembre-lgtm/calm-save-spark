import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Search, TrendingUp, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTransactionAnomalyDetection, TransactionAnomaly } from "@/hooks/useTransactionAnomalyDetection";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnomalyScannerProps {
  onAnomalyClick?: (transactionId: string) => void;
}

export function AnomalyScanner({ onAnomalyClick }: AnomalyScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const { anomalies, loading, summary, scanForAnomalies } = useTransactionAnomalyDetection(timeframe);
  const { toast } = useToast();

  const handleScan = async () => {
    setIsOpen(true);
    await scanForAnomalies();
    
    if (summary.total === 0) {
      toast({
        title: "No anomalies detected",
        description: "Your transactions look healthy!",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted';
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'duplicate': return AlertCircle;
      case 'high_tip': return TrendingUp;
      case 'price_hike': return TrendingUp;
      case 'outlier': return AlertTriangle;
      case 'unusual_merchant': return Info;
      default: return AlertTriangle;
    }
  };

  const formatAnomalyType = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={handleScan}
        className={cn(
          "fixed bottom-24 right-6 z-40",
          "w-14 h-14 rounded-full",
          "bg-destructive text-destructive-foreground",
          "shadow-glass-elevated backdrop-blur-glass",
          "hover:scale-110 transition-transform",
          "flex items-center justify-center",
          summary.total > 0 && "animate-pulse"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AlertTriangle className="w-6 h-6" />
        {summary.total > 0 && (
          <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground 
                         rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {summary.total}
          </span>
        )}
      </motion.button>

      {/* Scanner Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Anomaly Scanner
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <SheetDescription>
              AI-powered detection of unusual spending patterns
            </SheetDescription>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Scan period:</span>
              <Select value={timeframe} onValueChange={(v: any) => setTimeframe(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={scanForAnomalies}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? "Scanning..." : "Re-scan"}
              </Button>
            </div>
          </SheetHeader>

          {/* Scanning State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 mt-6"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Analyzing transactions...</span>
                <span className="font-medium">Scanning</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </motion.div>
          )}

          {/* Results Summary */}
          {!loading && summary.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-glass rounded-lg border border-glass-border"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Detection Summary</h3>
                <Badge variant="destructive">{summary.total} anomalies</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center p-2 bg-destructive/10 rounded">
                  <div className="font-bold text-destructive">{summary.high}</div>
                  <div className="text-muted-foreground text-xs">High</div>
                </div>
                <div className="text-center p-2 bg-warning/10 rounded">
                  <div className="font-bold text-warning">{summary.medium}</div>
                  <div className="text-muted-foreground text-xs">Medium</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-bold">{summary.low}</div>
                  <div className="text-muted-foreground text-xs">Low</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* No Anomalies State */}
          {!loading && summary.total === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-8 text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-semibold">No Anomalies Detected</h3>
              <p className="text-sm text-muted-foreground">
                Your transactions look healthy. No suspicious patterns found.
              </p>
            </motion.div>
          )}

          {/* Anomaly List */}
          {!loading && anomalies.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Flagged Transactions</h3>
              <AnimatePresence>
                {anomalies.map((anomaly, index) => {
                  const Icon = getAnomalyIcon(anomaly.anomalyType);
                  return (
                    <motion.div
                      key={anomaly.transactionId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "p-4 rounded-lg border-2 cursor-pointer",
                        "hover:shadow-glass transition-all",
                        "bg-glass backdrop-blur-glass",
                        anomaly.severity === 'high' && "border-destructive/50",
                        anomaly.severity === 'medium' && "border-warning/50",
                        anomaly.severity === 'low' && "border-muted"
                      )}
                      onClick={() => onAnomalyClick?.(anomaly.transactionId)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                          getSeverityColor(anomaly.severity)
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {formatAnomalyType(anomaly.anomalyType)}
                            </Badge>
                            <Badge className={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">{anomaly.explanation}</p>
                          <p className="text-xs text-muted-foreground">
                            💡 {anomaly.suggestedAction}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
