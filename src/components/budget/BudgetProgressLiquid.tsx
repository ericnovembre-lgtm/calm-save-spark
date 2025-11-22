import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BudgetProgressLiquidProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function BudgetProgressLiquid({ 
  percentage, 
  size = 100, 
  strokeWidth = 8 
}: BudgetProgressLiquidProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayPercentage / 100) * circumference;
  
  const isOverBudget = percentage > 100;
  const isWarning = percentage >= 80 && percentage < 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPercentage(Math.min(percentage, 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getColor = () => {
    if (isOverBudget) return "url(#critical-gradient)";
    if (isWarning) return "url(#warning-gradient)";
    return "url(#safe-gradient)";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="safe-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(160, 84%, 52%)" />
            <stop offset="100%" stopColor="hsl(160, 84%, 39%)" />
          </linearGradient>
          <linearGradient id="warning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(25, 95%, 53%)" />
            <stop offset="100%" stopColor="hsl(32, 95%, 44%)" />
          </linearGradient>
          <linearGradient id="critical-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(0, 84%, 60%)" />
            <stop offset="100%" stopColor="hsl(0, 91%, 71%)" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      
      {/* Liquid fill overlay for over-budget */}
      {isOverBudget && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute w-full h-full bg-destructive/20"
            initial={{ y: "100%" }}
            animate={{ 
              y: `${100 - Math.min(percentage, 150)}%`,
            }}
            transition={{ 
              duration: 1.5, 
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            {/* Wave effect */}
            <svg
              className="absolute top-0 left-0 w-full"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M0,5 Q25,8 50,5 T100,5 L100,0 L0,0 Z"
                fill="hsl(var(--destructive))"
                opacity={0.3}
                animate={{
                  d: [
                    "M0,5 Q25,8 50,5 T100,5 L100,0 L0,0 Z",
                    "M0,5 Q25,2 50,5 T100,5 L100,0 L0,0 Z",
                    "M0,5 Q25,8 50,5 T100,5 L100,0 L0,0 Z",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
      
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-2xl font-bold ${isOverBudget ? 'animate-pulse' : ''}`}
          style={{ color: getColor() }}
        >
          {displayPercentage.toFixed(0)}%
        </motion.span>
      </div>

      {/* Warning pulse effect */}
      {(isWarning || isOverBudget) && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: getColor() }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}
