import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface BudgetProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function BudgetProgress({ percentage, size = 100, strokeWidth = 8 }: BudgetProgressProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayPercentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPercentage(Math.min(percentage, 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getColor = () => {
    if (percentage >= 100) return "hsl(var(--destructive))";
    if (percentage >= 80) return "hsl(var(--warning))";
    return "hsl(var(--primary))";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
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
      
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold"
          style={{ color: getColor() }}
        >
          {displayPercentage.toFixed(0)}%
        </motion.span>
      </div>
    </div>
  );
}
