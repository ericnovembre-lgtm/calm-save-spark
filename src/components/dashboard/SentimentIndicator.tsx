import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SentimentIndicatorProps {
  netWorthChangePercent: number;
  className?: string;
}

export function SentimentIndicator({ netWorthChangePercent, className }: SentimentIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();

  const getSentiment = (change: number) => {
    if (change > 10) {
      return {
        emoji: '🚀',
        text: 'Strong Growth',
        color: 'bg-green-500/20 border-green-500/40 text-green-600 dark:text-green-400',
        icon: TrendingUp
      };
    } else if (change < -5) {
      return {
        emoji: '⚠️',
        text: 'Needs Attention',
        color: 'bg-orange-500/20 border-orange-500/40 text-orange-600 dark:text-orange-400',
        icon: AlertTriangle
      };
    }
    return {
      emoji: '📊',
      text: 'Steady',
      color: 'bg-primary/20 border-primary/40 text-primary',
      icon: Activity
    };
  };

  const sentiment = getSentiment(netWorthChangePercent);
  const Icon = sentiment.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border font-semibold text-sm",
        sentiment.color,
        className
      )}
    >
      <motion.span
        animate={!prefersReducedMotion ? {
          scale: [1, 1.2, 1],
        } : {}}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      >
        {sentiment.emoji}
      </motion.span>
      <Icon className="w-4 h-4" />
      <span>{sentiment.text}</span>
    </motion.div>
  );
}
