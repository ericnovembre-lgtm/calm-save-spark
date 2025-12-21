import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { LucideIcon, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HealthDiagnosticCardProps {
  title: string;
  subtitle: string;
  value: string;
  score: number;
  icon: LucideIcon;
  actionLabel?: string;
  actionLink?: string;
  details?: {
    label: string;
    value: string;
  }[];
  className?: string;
}

/**
 * Medical-Grade Glass Card with scan beam effect and z-axis zoom expansion
 */
export const HealthDiagnosticCard = ({
  title,
  subtitle,
  value,
  score,
  icon: Icon,
  actionLabel,
  actionLink,
  details = [],
  className,
}: HealthDiagnosticCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse position for subtle 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-100, 100], [2, -2]);
  const rotateY = useTransform(mouseX, [-100, 100], [-2, 2]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || prefersReducedMotion) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Score-based color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-green-500/5';
    if (score >= 60) return 'from-blue-500/20 to-blue-500/5';
    if (score >= 40) return 'from-yellow-500/20 to-yellow-500/5';
    return 'from-red-500/20 to-red-500/5';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        className={cn(
          'relative overflow-hidden rounded-2xl cursor-pointer',
          'backdrop-blur-xl bg-white/5 dark:bg-white/[0.03]',
          'border border-white/15 dark:border-white/10',
          'shadow-lg shadow-black/5',
          'transition-shadow duration-500',
          'hover:shadow-xl hover:shadow-primary/10',
          className
        )}
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
          perspective: 1000,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsExpanded(true)}
        whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        {/* Scan beam effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, hsla(var(--primary), 0.08) 50%, transparent 60%)',
            backgroundSize: '200% 200%',
          }}
          initial={{ backgroundPosition: '200% 200%' }}
          animate={isHovered && !prefersReducedMotion ? { backgroundPosition: '-100% -100%' } : { backgroundPosition: '200% 200%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Gradient background based on score */}
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', getScoreGradient(score))} />

        <div className="relative p-6 z-20">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2.5 rounded-xl bg-white/10 backdrop-blur-sm', getScoreColor(score))}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            <div className={cn('text-2xl font-bold', getScoreColor(score))}>
              {score}
            </div>
          </div>

          {/* Value display */}
          <div className="mb-4">
            <span className="text-3xl font-bold text-foreground">{value}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', getProgressColor(score))}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Action hint */}
          {actionLabel && (
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Tap to expand</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Subtle border glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: `inset 0 0 20px hsla(var(--primary), 0.1)`,
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Expanded Modal (Z-axis zoom) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Expanded card */}
            <motion.div
              className={cn(
                'relative max-w-lg w-full rounded-3xl overflow-hidden',
                'backdrop-blur-2xl bg-card/95',
                'border border-white/20',
                'shadow-2xl shadow-black/30'
              )}
              initial={{ scale: 0.7, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient header */}
              <div className={cn('p-6 bg-gradient-to-br', getScoreGradient(score))}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn('p-3 rounded-2xl bg-white/20 backdrop-blur-sm', getScoreColor(score))}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{title}</h2>
                      <p className="text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/10 hover:bg-white/20"
                    onClick={() => setIsExpanded(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Large score display */}
                <div className="mt-6 flex items-baseline gap-3">
                  <span className={cn('text-6xl font-bold', getScoreColor(score))}>{score}</span>
                  <span className="text-xl text-muted-foreground">/100</span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full', getProgressColor(score))}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              {/* Details section */}
              <div className="p-6 space-y-4">
                <div className="text-center py-4">
                  <span className="text-4xl font-bold text-foreground">{value}</span>
                </div>

                {details.length > 0 && (
                  <div className="space-y-3">
                    {details.map((detail, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-sm text-muted-foreground">{detail.label}</span>
                        <span className="text-sm font-medium text-foreground">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action button */}
                {actionLabel && actionLink && (
                  <Link to={actionLink}>
                    <Button className="w-full mt-4" size="lg">
                      {actionLabel}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
