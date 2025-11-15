import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LucideIcon, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import CountUp from "react-countup";

interface MetricCardProps {
  title: string;
  value: string;
  numericValue?: number;
  score: number;
  icon: LucideIcon;
  trend?: number;
  actionLabel: string;
  actionLink: string;
  subtitle?: string;
}

export const MetricCard = ({
  title,
  value,
  numericValue,
  score,
  icon: Icon,
  trend,
  actionLabel,
  actionLink,
  subtitle,
}: MetricCardProps) => {
  const prefersReducedMotion = useReducedMotion();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-blue-600";
    if (score >= 40) return "bg-yellow-600";
    return "bg-red-600";
  };

  const isExcellent = score >= 80;

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className="relative overflow-hidden p-6 hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-card to-accent/5">
        {/* Sparkles for excellent metrics */}
        {isExcellent && !prefersReducedMotion && (
          <motion.div
            className="absolute top-4 right-4"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Sparkles className={`w-5 h-5 ${getScoreColor(score)}`} />
          </motion.div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 rounded-xl bg-accent/30 flex items-center justify-center backdrop-blur-sm"
              whileHover={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Icon className="w-6 h-6 text-accent-foreground" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <motion.span
            className={`text-3xl font-bold ${getScoreColor(score)}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            {score}
          </motion.span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Status</p>
            <p className="text-xl font-semibold text-foreground">
              {numericValue !== undefined ? (
                <CountUp end={numericValue} duration={1.5} separator="," />
              ) : (
                value
              )}
            </p>
          </div>

          <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getProgressColor(score)} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          {trend !== undefined && (
            <motion.p
              className={`text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </motion.p>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between group mt-2 hover:bg-primary/5"
            asChild
          >
            <Link to={actionLink}>
              {actionLabel}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
