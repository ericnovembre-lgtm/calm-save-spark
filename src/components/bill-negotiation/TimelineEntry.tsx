import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle, ArrowRight, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface TimelineEntryProps {
  merchant: string;
  beforeAmount: number;
  afterAmount: number | null;
  savings: number | null;
  requestedAt: string;
  completedAt: string | null;
  status: string;
  notes: string | null;
  isLast?: boolean;
}

export function TimelineEntry({
  merchant,
  beforeAmount,
  afterAmount,
  savings,
  requestedAt,
  completedAt,
  status,
  notes,
  isLast = false,
}: TimelineEntryProps) {
  const [expanded, setExpanded] = useState(false);
  
  const statusConfig = {
    completed: { icon: CheckCircle2, color: "text-success", bg: "bg-success/20", borderColor: "border-success", label: "SUCCESS" },
    in_progress: { icon: Clock, color: "text-warning", bg: "bg-warning/20", borderColor: "border-warning", label: "IN PROGRESS" },
    pending: { icon: Clock, color: "text-accent", bg: "bg-accent/20", borderColor: "border-accent", label: "PENDING" },
    failed: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/20", borderColor: "border-destructive", label: "FAILED" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  const savingsPercent = afterAmount ? ((beforeAmount - afterAmount) / beforeAmount * 100) : 0;
  const duration = completedAt 
    ? Math.round((new Date(completedAt).getTime() - new Date(requestedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleHover = () => {
    if (status === 'completed' && savings && savings > 0) {
      confetti({
        particleCount: 20,
        spread: 30,
        origin: { y: 0.6 },
        colors: ['#34d399', '#10b981', '#059669'],
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative flex gap-8"
      onMouseEnter={handleHover}
    >
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border" />
      )}

      {/* Timeline Node */}
      <div className="relative flex-shrink-0">
        <motion.div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center z-10 relative",
            config.bg,
            "border-2",
            config.borderColor
          )}
          whileHover={{ scale: 1.1 }}
        >
          <StatusIcon className={`w-6 h-6 ${config.color}`} />
        </motion.div>
        
        {/* Pulse effect for completed */}
        {status === 'completed' && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-success"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Content Card */}
      <GlassPanel
        className="flex-1 mb-8 overflow-hidden cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <motion.div whileHover={{ y: -2 }}>
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">{merchant}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {completedAt ? (
                    <span>Completed {formatDistanceToNow(new Date(completedAt), { addSuffix: true })}</span>
                  ) : (
                    <span>Started {formatDistanceToNow(new Date(requestedAt), { addSuffix: true })}</span>
                  )}
                </div>
              </div>
              <Badge variant="outline" className={config.color}>
                {config.label}
              </Badge>
            </div>
          </div>

          {/* Before/After Comparison */}
          {status === 'completed' && afterAmount !== null && (
            <div className="p-6 bg-muted/20">
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Before */}
                <div className="text-center p-4 border border-destructive/30 rounded-xl bg-destructive/10">
                  <div className="text-xs text-muted-foreground uppercase mb-1">Before</div>
                  <div className="text-2xl font-bold text-destructive">${beforeAmount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">/month</div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center">
                  <ArrowRight className="w-8 h-8 text-accent mb-2" />
                  <div className="text-success font-bold text-sm">
                    -{savingsPercent.toFixed(0)}%
                  </div>
                </div>

                {/* After */}
                <div className="text-center p-4 border border-success/30 rounded-xl bg-success/10">
                  <div className="text-xs text-muted-foreground uppercase mb-1">After</div>
                  <div className="text-2xl font-bold text-success">${afterAmount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">/month</div>
                </div>
              </div>

              {/* Savings Stamp */}
              {savings && savings > 0 && (
                <motion.div
                  className="mt-6 p-4 border-2 border-success rounded-xl text-center relative overflow-hidden"
                  initial={{ rotate: -2 }}
                  whileHover={{ rotate: 0, scale: 1.05 }}
                >
                  <div className="absolute inset-0 bg-success/5" />
                  <div className="relative z-10">
                    <DollarSign className="w-8 h-8 text-success mx-auto mb-2" />
                    <div className="text-3xl font-bold text-success">
                      SAVED ${(savings * 12).toFixed(0)}/YR
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      ${savings.toFixed(2)}/mo sustained
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Metadata */}
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="p-6 border-t border-border space-y-3"
            >
              {duration !== null && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Negotiation Duration:</span>
                  <span className="text-foreground font-medium">{duration} days</span>
                </div>
              )}
              {notes && (
                <div className="text-sm">
                  <div className="text-muted-foreground mb-1">Notes:</div>
                  <div className="text-foreground p-3 bg-muted/30 rounded-xl border border-border">
                    {notes}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </GlassPanel>
    </motion.div>
  );
}