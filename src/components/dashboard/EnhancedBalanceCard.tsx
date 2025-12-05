import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { SaveplusAnimIcon } from "@/components/icons";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeInUp } from "@/lib/motion-variants";
import { liveUpdatePulse } from "@/lib/motion-variants-streaming";
import { AnimatedCounter } from "./AnimatedCounter";
import { TrendSparkline } from "./TrendSparkline";
import { SavingsVelocityGauge } from "./SavingsVelocityGauge";
import { useTripleTap } from "@/hooks/useTripleTap";
import { NeutralConfetti } from "@/components/effects/NeutralConfetti";
import { useCelebrationSounds } from "@/hooks/useCelebrationSounds";
import { haptics } from "@/lib/haptics";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { DraggableCoin } from "./DraggableCoin";
import { useDragToSave } from "@/hooks/useDragToSave";
import { cn } from "@/lib/utils";
import { getSentimentColors, getAuroraClass } from "@/lib/bento-sizes";
import { LiveDataPulse } from "./realtime/LiveDataPulse";

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
  
  // Track previous balance for LiveDataPulse
  const [previousBalance, setPreviousBalance] = useState(balance);
  const [isPulsing, setIsPulsing] = useState(false);
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (balance !== previousBalance) {
      setIsPulsing(true);
      const timeout = setTimeout(() => {
        setPreviousBalance(balance);
        setIsPulsing(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [balance, previousBalance]);

  // Calculate change percentage for aurora effect
  const changePercent = balance > 0 ? (monthlyGrowth / balance) * 100 : 0;
  const sentimentColors = getSentimentColors(changePercent);
  const auroraClass = getAuroraClass(changePercent);

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
    <GlassCard 
      data-tour="balance-card" 
      enableTilt 
      glowOnHover 
      variant="hero"
      className="p-6 md:p-8 overflow-hidden relative"
    >
      <NeutralConfetti show={showConfetti} duration={2500} count={35} />
      
      {/* Aurora gradient background based on sentiment */}
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-1000",
          auroraClass
        )}
        style={{ opacity: 0.5 }}
      />
      
      {/* Animated mesh blobs */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl pointer-events-none"
            style={{ background: sentimentColors.primary, opacity: 0.2 }}
            animate={{
              x: [0, 30, 0],
              y: [0, 20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full blur-3xl pointer-events-none"
            style={{ background: sentimentColors.secondary, opacity: 0.15 }}
            animate={{
              x: [0, -20, 0],
              y: [0, -15, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </>
      )}
      
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
        className="relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <LiveDataPulse
                value={balance}
                previousValue={previousBalance}
                showLiveBadge
                showDirection={balance !== previousBalance}
                pulseColor="cyan"
              />
            </div>
            <motion.div 
              {...register}
              variants={!prefersReducedMotion ? liveUpdatePulse : undefined}
              animate={isPulsing && !prefersReducedMotion ? 'pulse' : 'idle'}
              className="flex items-baseline gap-1 cursor-pointer select-none"
              initial={{ scale: 0.9, opacity: 0 }}
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
                {(() => {
                  if (!weeklyTrend.length || weeklyTrend[0] === 0) return '0.0%';
                  const first = weeklyTrend[0];
                  const last = weeklyTrend[weeklyTrend.length - 1];
                  const change = ((last - first) / first) * 100;
                  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
                })()}
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

      {/* Ambient glow effect - now uses sentiment color */}
      <motion.div
        className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ background: sentimentColors.glow }}
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
