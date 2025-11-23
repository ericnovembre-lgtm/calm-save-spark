import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle, ArrowRight, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import confetti from "canvas-confetti";

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
    completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/20", label: "SUCCESS" },
    in_progress: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/20", label: "IN PROGRESS" },
    pending: { icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/20", label: "PENDING" },
    failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20", label: "FAILED" },
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
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-cyan-500/30" />
      )}

      {/* Timeline Node */}
      <div className="relative flex-shrink-0">
        <motion.div
          className={`w-12 h-12 rounded-full ${config.bg} border-2 border-cyan-500 flex items-center justify-center z-10 relative`}
          whileHover={{ scale: 1.1 }}
        >
          <StatusIcon className={`w-6 h-6 ${config.color}`} />
        </motion.div>
        
        {/* Pulse effect for completed */}
        {status === 'completed' && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-emerald-400"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Content Card */}
      <motion.div
        className="flex-1 mb-8 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all cursor-pointer"
        whileHover={{ y: -2, boxShadow: "0 0 20px rgba(6, 182, 212, 0.2)" }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
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
          <div className="p-6 bg-slate-950">
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Before */}
              <div className="text-center p-4 border border-red-500/30 rounded-lg bg-red-500/10">
                <div className="text-xs text-muted-foreground uppercase mb-1">Before</div>
                <div className="text-2xl font-bold text-red-400">${beforeAmount.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">/month</div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center">
                <ArrowRight className="w-8 h-8 text-cyan-400 mb-2" />
                <div className="text-emerald-400 font-bold text-sm">
                  -{savingsPercent.toFixed(0)}%
                </div>
              </div>

              {/* After */}
              <div className="text-center p-4 border border-emerald-500/30 rounded-lg bg-emerald-500/10">
                <div className="text-xs text-muted-foreground uppercase mb-1">After</div>
                <div className="text-2xl font-bold text-emerald-400">${afterAmount.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">/month</div>
              </div>
            </div>

            {/* Savings Stamp */}
            {savings && savings > 0 && (
              <motion.div
                className="mt-6 p-4 border-2 border-emerald-500 rounded-lg text-center relative overflow-hidden"
                initial={{ rotate: -2 }}
                whileHover={{ rotate: 0, scale: 1.05 }}
              >
                <div className="absolute inset-0 bg-emerald-500/5" />
                <div className="relative z-10">
                  <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-emerald-400">
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
            className="p-6 border-t border-slate-700 space-y-3"
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
                <div className="text-foreground p-3 bg-slate-800 rounded border border-slate-700">
                  {notes}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}