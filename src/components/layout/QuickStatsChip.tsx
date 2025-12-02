import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface QuickStatsChipProps {
  netWorth?: number;
  trend?: "up" | "down";
  trendPercent?: number;
  savingsProgress?: number;
}

export const QuickStatsChip = ({ 
  netWorth = 24580, 
  trend = "up", 
  trendPercent = 12.5,
  savingsProgress = 75 
}: QuickStatsChipProps) => {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full glass-bg-strong backdrop-blur-xl border border-accent/20 shadow-glass"
    >
      {/* Net Worth */}
      <div className="flex items-center gap-1.5">
        <TrendIcon 
          className={cn(
            "w-3.5 h-3.5",
            trend === "up" ? "text-success" : "text-destructive"
          )} 
        />
        <div className="flex flex-col">
          <span className="text-xs font-medium leading-none">
            ${netWorth.toLocaleString()}
          </span>
          <span className={cn(
            "text-[10px] leading-none mt-0.5",
            trend === "up" ? "text-success" : "text-destructive"
          )}>
            {trend === "up" ? "+" : "-"}{trendPercent}%
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Savings Progress Ring */}
      <div className="relative">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          {/* Background circle */}
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted"
            opacity="0.2"
          />
          {/* Progress circle */}
          <motion.circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-accent"
            initial={{ strokeDashoffset: 88 }}
            animate={{ 
              strokeDashoffset: 88 - (88 * savingsProgress) / 100 
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              strokeDasharray: 88,
            }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
          {savingsProgress}
        </span>
      </div>
    </motion.div>
  );
};
