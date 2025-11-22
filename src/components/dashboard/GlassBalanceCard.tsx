import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlassBalanceCardProps {
  balance: number;
  change: number;
  label?: string;
  className?: string;
}

export function GlassBalanceCard({ 
  balance, 
  change, 
  label = "Total Balance",
  className 
}: GlassBalanceCardProps) {
  const changePercent = (change / balance) * 100;
  const isPositive = change > 0;
  const isNeutral = Math.abs(change) < 0.01;

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <GlassCard 
      enableTilt
      glowOnHover
      className={cn("p-6", className)}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        
        <div className="flex items-baseline gap-3 mb-3">
          <motion.h2 
            className="text-4xl font-bold text-foreground"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            ${balance.toLocaleString(undefined, { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </motion.h2>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
              "backdrop-blur-md border",
              isPositive && "bg-success/10 border-success/30 text-success",
              !isPositive && !isNeutral && "bg-destructive/10 border-destructive/30 text-destructive",
              isNeutral && "bg-muted/10 border-border text-muted-foreground"
            )}
          >
            <Icon className="w-3 h-3" />
            <span>
              {isPositive && "+"}
              {changePercent.toFixed(1)}%
            </span>
          </motion.div>
          
          <p className="text-xs text-muted-foreground">
            {isPositive ? "+" : ""}${change.toLocaleString()} this month
          </p>
        </div>
      </motion.div>
    </GlassCard>
  );
}
