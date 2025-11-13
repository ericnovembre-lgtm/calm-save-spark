import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HealthScoreGaugeProps {
  score: number;
  trend?: number;
}

export const HealthScoreGauge = ({ score, trend }: HealthScoreGaugeProps) => {
  const getScoreRating = (score: number) => {
    if (score >= 81) return { label: "Excellent", color: "text-green-600 dark:text-green-400" };
    if (score >= 61) return { label: "Good", color: "text-blue-600 dark:text-blue-400" };
    if (score >= 41) return { label: "Fair", color: "text-yellow-600 dark:text-yellow-400" };
    return { label: "Poor", color: "text-red-600 dark:text-red-400" };
  };

  const rating = getScoreRating(score);
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="90"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-muted opacity-20"
          />
          {/* Progress circle */}
          <motion.circle
            cx="96"
            cy="96"
            r="90"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            className={rating.color}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-5xl font-bold ${rating.color}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {score}
          </motion.span>
          <span className="text-sm text-muted-foreground">out of 100</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className={`text-2xl font-semibold ${rating.color}`}>{rating.label}</p>
        {trend !== undefined && trend !== 0 && (
          <div className="flex items-center justify-center gap-1 mt-2">
            {trend > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">+{trend} this month</span>
              </>
            ) : trend < 0 ? (
              <>
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">{trend} this month</span>
              </>
            ) : (
              <>
                <Minus className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No change</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
