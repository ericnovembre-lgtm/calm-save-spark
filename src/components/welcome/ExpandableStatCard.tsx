import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ChevronDown, TrendingUp, Users, DollarSign } from "lucide-react";
import { AnimatedCounter } from "@/components/onboarding/AnimatedCounter";
import { Stat } from "@/components/welcome/types";

type ExpandableStatCardProps = Stat;

export const ExpandableStatCard = ({
  label,
  value,
  suffix = "",
  icon,
  delay = 0,
  breakdown,
}: ExpandableStatCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!prefersReducedMotion) {
      const timer = setTimeout(() => {
        setShowSparkle(true);
        setTimeout(() => setShowSparkle(false), 1000);
      }, delay * 1000 + 1500);
      return () => clearTimeout(timer);
    }
  }, [delay, prefersReducedMotion]);

  const getBreakdownChart = () => {
    if (!breakdown) return null;

    return (
      <div className="space-y-3">
        {breakdown.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative"
    >
      <motion.div
        className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)] border border-border/50 transition-all hover:shadow-[var(--shadow-soft)] group overflow-hidden cursor-pointer"
        onClick={() => breakdown && setIsExpanded(!isExpanded)}
        whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Sparkle effect */}
        <AnimatePresence>
          {showSparkle && (
            <motion.div
              className="absolute top-4 right-4"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="text-accent">✨</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/20 to-accent/0 opacity-0 group-hover:opacity-100"
          initial={false}
          transition={{ duration: 0.5 }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            {icon && (
              <motion.div
                className="text-foreground"
                whileHover={prefersReducedMotion ? {} : { rotate: [0, -5, 5, 0], scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                {icon}
              </motion.div>
            )}
            {breakdown && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            )}
          </div>

          <div className="flex items-baseline gap-1 mb-2">
            <motion.div
              className="text-3xl md:text-4xl font-display font-bold text-foreground tabular-nums"
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <AnimatedCounter value={value} duration={1.5} />
            </motion.div>
            {suffix && (
              <span className="text-2xl md:text-3xl font-display font-bold text-foreground">
                {suffix}
              </span>
            )}
          </div>

          <p className="text-xs md:text-sm text-muted-foreground font-medium mb-2">
            {label}
          </p>

          {/* Breakdown section */}
          <AnimatePresence>
            {isExpanded && breakdown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-border"
              >
                {getBreakdownChart()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
