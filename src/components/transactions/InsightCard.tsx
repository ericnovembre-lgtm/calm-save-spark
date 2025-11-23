import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Calendar, Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface InsightCardProps {
  insight: {
    id: string;
    type: 'trend' | 'alert' | 'upcoming' | 'tip';
    icon?: string;
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'critical';
    actionLabel?: string;
    actionLink?: string;
  };
  onAction?: () => void;
}

const iconMap = {
  trend: TrendingUp,
  alert: AlertTriangle,
  upcoming: Calendar,
  tip: Lightbulb,
};

const severityColors = {
  info: {
    bg: "bg-accent/10",
    border: "border-accent/20",
    text: "text-accent",
    icon: "text-accent",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/20",
    text: "text-warning",
    icon: "text-warning",
  },
  critical: {
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    text: "text-destructive",
    icon: "text-destructive",
  },
};

export function InsightCard({ insight, onAction }: InsightCardProps) {
  const Icon = iconMap[insight.type];
  const colors = severityColors[insight.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "p-3 rounded-xl border",
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <Icon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", colors.icon)} />
        <div className="flex-1 min-w-0">
          <h4 className={cn("text-sm font-semibold mb-1", colors.text)}>
            {insight.title}
          </h4>
          <p className="text-xs text-foreground/80 leading-relaxed">
            {insight.description}
          </p>
        </div>
      </div>

      {insight.actionLabel && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className={cn("w-full text-xs h-7 mt-2", colors.text)}
        >
          {insight.actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
