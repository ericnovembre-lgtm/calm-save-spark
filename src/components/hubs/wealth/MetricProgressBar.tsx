import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MetricProgressBarProps {
  value: number;
  max?: number;
  label: string;
  color?: string;
}

export function MetricProgressBar({ value, max = 100, label, color = "hsl(var(--primary))" }: MetricProgressBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{Math.round(value)}{max === 100 ? '%' : ''}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={prefersReducedMotion ? false : { width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
    </div>
  );
}
