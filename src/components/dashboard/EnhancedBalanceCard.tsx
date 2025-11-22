import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SaveplusAnimIcon } from "@/components/icons";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeInUp } from "@/lib/motion-variants";
import { AnimatedCounter } from "./AnimatedCounter";
import { TrendSparkline } from "./TrendSparkline";
import { SavingsVelocityGauge } from "./SavingsVelocityGauge";
import { useTripleTap } from "@/hooks/useTripleTap";
import { NeutralConfetti } from "@/components/effects/NeutralConfetti";
import { useCelebrationSounds } from "@/hooks/useCelebrationSounds";
import { haptics } from "@/lib/haptics";
import { toast } from "sonner";
import { useState } from "react";
import { DraggableCoin } from "./DraggableCoin";
import { useDragToSave } from "@/hooks/useDragToSave";

interface EnhancedBalanceCardProps {
  balance: number;
  monthlyGrowth?: number;
  savingsVelocity?: number;
  weeklyTrend?: number[];
  onDragToGoal?: (goalId: string, amount: number) => Promise<void>;
}

export const EnhancedBalanceCard = ({ 
  balance, 
  monthlyGrowth = 0,
  savingsVelocity = 50,
  weeklyTrend = [2800, 2950, 3100, 3050, 3200, 3180, 3247],
  onDragToGoal
}: EnhancedBalanceCardProps) => {
  const { isDragging, getDragHandlers } = useDragToSave({
    onDrop: onDragToGoal || (async () => {}),
    defaultAmount: 100
  });
  const { convertedAmount, targetCurrency } = useCurrencyConversion(balance);
  const prefersReducedMotion = useReducedMotion();
  const isPositive = monthlyGrowth >= 0;
  const [showConfetti, setShowConfetti] = useState(false);
  const { playConfettiPop } = useCelebrationSounds();

  const handleTripleTap = () => {
    setShowConfetti(true);
    playConfettiPop();
    haptics.achievementUnlocked();
    toast.success("✨ Secret found! Keep exploring...", {
      duration: 3000
    });
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const { register } = useTripleTap({ onTripleTap: handleTripleTap });

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$", EUR: "€", GBP: "£", JPY: "¥", CNY: "¥"
    };
    return symbols[currency] || "$";
  };

  return (
    <GlassCard enableTilt glowOnHover className="p-6 md:p-8 overflow-hidden relative">
      <NeutralConfetti show={showConfetti} duration={2500} count={35} />
      
      {/* Draggable coin for drag-to-save */}
      {onDragToGoal && (
        <DraggableCoin 
          amount={100}
          dragHandlers={getDragHandlers()}
          isDragging={isDragging}
        />
      )}
      
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
              {...register}
              className="flex items-baseline gap-1 cursor-pointer select-none"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileTap={!prefersReducedMotion ? { scale: 0.98 } : undefined}
            >
              <span className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {getCurrencySymbol(targetCurrency)}
              </span>
              <AnimatedCounter 
                value={convertedAmount} 
                decimals={2}
                className="text-4xl md:text-5xl font-display font-bold text-foreground"
              />
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

        {/* Sparkline and Velocity */}
        <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">7-day trend</span>
              <span className="text-xs font-semibold text-foreground">
                {isPositive ? "+" : ""}
                {((weeklyTrend[weeklyTrend.length - 1] - weeklyTrend[0]) / weeklyTrend[0] * 100).toFixed(1)}%
              </span>
            </div>
            <TrendSparkline data={weeklyTrend} width={200} height={40} />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">Savings Velocity</div>
            <SavingsVelocityGauge velocity={savingsVelocity} />
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
