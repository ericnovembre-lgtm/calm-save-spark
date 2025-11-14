import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SaveplusAnimIcon } from "@/components/icons";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeInUp } from "@/lib/motion-variants";

interface EnhancedBalanceCardProps {
  balance: number;
  monthlyGrowth?: number;
}

export const EnhancedBalanceCard = ({ balance, monthlyGrowth = 0 }: EnhancedBalanceCardProps) => {
  const { convertedAmount, targetCurrency } = useCurrencyConversion(balance);
  const prefersReducedMotion = useReducedMotion();
  const isPositive = monthlyGrowth >= 0;

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$", EUR: "€", GBP: "£", JPY: "¥", CNY: "¥"
    };
    return symbols[currency] || "$";
  };

  return (
    <GlassCard enableTilt glowOnHover className="p-6 md:p-8 overflow-hidden">
      <motion.div
        variants={!prefersReducedMotion ? fadeInUp : undefined}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
            <motion.div 
              className="flex items-baseline gap-2"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-4xl md:text-5xl font-display font-bold text-foreground tabular-nums">
                {getCurrencySymbol(targetCurrency)}
                {convertedAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </motion.div>
          </div>
          
          {/* Animated Icon */}
          <motion.div
            whileHover={!prefersReducedMotion ? { rotate: 360, scale: 1.1 } : undefined}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <SaveplusAnimIcon 
              name="wallet" 
              size={48} 
              className="text-primary"
              decorative
            />
          </motion.div>
        </div>

        {/* Monthly Growth */}
        {monthlyGrowth !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl w-fit",
              "backdrop-blur-sm border",
              isPositive 
                ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
            )}
          >
            <motion.div
              animate={!prefersReducedMotion ? {
                y: isPositive ? [-2, 0, -2] : [0, 2, 0]
              } : undefined}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </motion.div>
            <span className="text-sm font-semibold">
              {isPositive ? "+" : ""}{getCurrencySymbol(targetCurrency)}
              {Math.abs(monthlyGrowth).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
            <span className="text-xs opacity-70">this month</span>
          </motion.div>
        )}

        {/* Sparkline placeholder - will enhance in Phase 2 */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>7-day trend</span>
            <motion.div
              animate={!prefersReducedMotion ? {
                opacity: [0.5, 1, 0.5]
              } : undefined}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-primary"
            >
              Coming soon
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Ambient glow effect */}
      <motion.div
        className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"
        animate={!prefersReducedMotion ? {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        } : undefined}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </GlassCard>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
