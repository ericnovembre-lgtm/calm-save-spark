import { motion } from "framer-motion";
import { Sparkles, Rocket, Clock } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FeatureBadgeProps {
  status: "available" | "beta" | "coming-soon";
  className?: string;
}

export function FeatureBadge({ status, className = "" }: FeatureBadgeProps) {
  const prefersReducedMotion = useReducedMotion();

  if (status === "available") {
    return null; // No badge for available features
  }

  const badgeConfig = {
    beta: {
      icon: <Rocket className="w-3 h-3" />,
      label: "Beta",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-500/20",
    },
    "coming-soon": {
      icon: <Clock className="w-3 h-3" />,
      label: "Coming Soon",
      bgColor: "bg-muted/50",
      textColor: "text-muted-foreground",
      borderColor: "border-border",
    },
  };

  const config = badgeConfig[status];

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </motion.div>
  );
}
