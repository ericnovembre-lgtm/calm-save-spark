import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import CountUp from 'react-countup';

interface LiquidMetricCardProps {
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

export const LiquidMetricCard = ({
  title,
  value,
  numericValue,
  score,
  icon: Icon,
  trend,
  actionLabel,
  actionLink,
  subtitle,
}: LiquidMetricCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return {
      bg: 'from-[hsl(var(--health-excellent)/0.2)] to-[hsl(var(--health-excellent)/0.1)]',
      border: 'border-[hsl(var(--health-excellent)/0.3)]',
      text: 'text-[hsl(var(--health-excellent))]',
      glow: 'shadow-[hsl(var(--health-excellent)/0.2)]',
      liquid: 'fill-[hsl(var(--health-excellent)/0.3)]'
    };
    if (score >= 60) return {
      bg: 'from-[hsl(var(--health-good)/0.2)] to-[hsl(var(--health-good)/0.1)]',
      border: 'border-[hsl(var(--health-good)/0.3)]',
      text: 'text-[hsl(var(--health-good))]',
      glow: 'shadow-[hsl(var(--health-good)/0.2)]',
      liquid: 'fill-[hsl(var(--health-good)/0.3)]'
    };
    if (score >= 40) return {
      bg: 'from-[hsl(var(--health-fair)/0.2)] to-[hsl(var(--health-fair)/0.1)]',
      border: 'border-[hsl(var(--health-fair)/0.3)]',
      text: 'text-[hsl(var(--health-fair))]',
      glow: 'shadow-[hsl(var(--health-fair)/0.2)]',
      liquid: 'fill-[hsl(var(--health-fair)/0.3)]'
    };
    return {
      bg: 'from-[hsl(var(--health-poor)/0.2)] to-[hsl(var(--health-poor)/0.1)]',
      border: 'border-[hsl(var(--health-poor)/0.3)]',
      text: 'text-[hsl(var(--health-poor))]',
      glow: 'shadow-[hsl(var(--health-poor)/0.2)]',
      liquid: 'fill-[hsl(var(--health-poor)/0.3)]'
    };
  };

  const colors = getScoreColor(score);
  const isExcellent = score >= 80;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={prefersReducedMotion ? {} : { rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className={`relative overflow-hidden p-6 bg-gradient-to-br ${colors.bg} border-2 ${colors.border} ${colors.glow} shadow-xl backdrop-blur-sm`}>
        {/* Liquid fill background */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d={`M 0 ${100 - score} Q 25 ${100 - score - 5} 50 ${100 - score} T 100 ${100 - score} L 100 100 L 0 100 Z`}
              className={colors.liquid}
              initial={{ d: `M 0 100 Q 25 100 50 100 T 100 100 L 100 100 L 0 100 Z` }}
              animate={{
                d: [
                  `M 0 ${100 - score} Q 25 ${100 - score - 5} 50 ${100 - score} T 100 ${100 - score} L 100 100 L 0 100 Z`,
                  `M 0 ${100 - score} Q 25 ${100 - score + 5} 50 ${100 - score} T 100 ${100 - score} L 100 100 L 0 100 Z`,
                  `M 0 ${100 - score} Q 25 ${100 - score - 5} 50 ${100 - score} T 100 ${100 - score} L 100 100 L 0 100 Z`,
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </svg>
        </div>

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
              ease: 'linear'
            }}
          >
            <Sparkles className={`w-6 h-6 ${colors.text}`} />
          </motion.div>
        )}

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center`}
                whileHover={{ rotate: prefersReducedMotion ? 0 : 360 }}
                transition={{ duration: 0.6 }}
              >
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </motion.div>
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
            <motion.span
              className={`text-3xl font-bold ${colors.text}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
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

            {trend !== undefined && (
              <motion.div
                className={`flex items-center gap-2 text-sm font-medium ${trend >= 0 ? 'text-[hsl(var(--health-excellent))]' : 'text-[hsl(var(--health-poor))]'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.span
                  animate={{ y: trend >= 0 ? [-2, 0, -2] : [2, 0, 2] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {trend >= 0 ? '↑' : '↓'}
                </motion.span>
                <span>{Math.abs(trend)}% from last month</span>
              </motion.div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-between group hover:bg-background/50 ${colors.text}`}
              asChild
            >
              <Link to={actionLink}>
                {actionLabel}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Ripple effect on click */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={false}
          whileTap={prefersReducedMotion ? {} : {
            scale: [1, 1.5],
            opacity: [0.3, 0],
          }}
          transition={{ duration: 0.6 }}
        />
      </Card>
    </motion.div>
  );
};
