import { motion } from "framer-motion";
import { CheckCircle2, Rocket, Clock } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface StatusCount {
  available: number;
  beta: number;
  comingSoon: number;
}

interface FeatureStatusSummaryProps {
  statusCount: StatusCount;
}

export function FeatureStatusSummary({ statusCount }: FeatureStatusSummaryProps) {
  const prefersReducedMotion = useReducedMotion();

  const stats = [
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      label: "Available",
      count: statusCount.available,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      icon: <Rocket className="w-5 h-5" />,
      label: "Beta",
      count: statusCount.beta,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Coming Soon",
      count: statusCount.comingSoon,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
    },
  ];

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
          className={`${stat.bgColor} rounded-lg p-6 border border-border/50`}
        >
          <div className="flex items-center gap-3">
            <div className={stat.color}>{stat.icon}</div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stat.count}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
