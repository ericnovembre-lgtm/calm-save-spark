import { motion } from 'framer-motion';
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PulseHealthScoreProps {
  score: number;
  trend?: 'up' | 'down' | 'stable';
}

export function PulseHealthScore({ score, trend = 'stable' }: PulseHealthScoreProps) {
  const getScoreColor = () => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const getGradient = () => {
    if (score >= 70) return 'from-green-500/20 to-emerald-500/10';
    if (score >= 40) return 'from-amber-500/20 to-orange-500/10';
    return 'from-red-500/20 to-rose-500/10';
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-2xl bg-gradient-to-br ${getGradient()} p-6 border border-border/50`}
      data-copilot-id="pulse-health-score"
    >
      {/* Background pulse animation */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          boxShadow: [
            `0 0 20px 0 ${score >= 70 ? 'rgba(34, 197, 94, 0.2)' : score >= 40 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            `0 0 40px 0 ${score >= 70 ? 'rgba(34, 197, 94, 0.1)' : score >= 40 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
            `0 0 20px 0 ${score >= 70 ? 'rgba(34, 197, 94, 0.2)' : score >= 40 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Financial Health Score</span>
          </div>
          
          <div className="flex items-baseline gap-3">
            <motion.span
              className={`text-5xl font-bold ${getScoreColor()}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={score}
            >
              {score}
            </motion.span>
            <span className="text-lg text-muted-foreground">/100</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className={`text-sm font-medium ${getScoreColor()}`}>{getScoreLabel()}</span>
            <TrendIcon className={`w-4 h-4 ${
              trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
            }`} />
          </div>
        </div>

        {/* Circular progress indicator */}
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted/20"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={getScoreColor()}
              initial={{ strokeDasharray: '0 251.2' }}
              animate={{ strokeDasharray: `${(score / 100) * 251.2} 251.2` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className={`w-8 h-8 ${getScoreColor()}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
