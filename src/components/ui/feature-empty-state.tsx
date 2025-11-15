import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FeatureEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  features?: Array<{ icon: LucideIcon; label: string }>;
}

export function FeatureEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  features,
}: FeatureEmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8 sm:p-12 text-center">
        <motion.div
          initial={prefersReducedMotion ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
        </motion.div>

        <h2 className="text-xl sm:text-2xl font-bold mb-3">{title}</h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-6">
          {description}
        </p>

        {features && features.length > 0 && (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto mb-6">
            {features.map((feature, idx) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + idx * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-left"
                >
                  <FeatureIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature.label}</span>
                </motion.div>
              );
            })}
          </div>
        )}

        {actionLabel && onAction && (
          <Button onClick={onAction} size="lg" className="gap-2">
            {actionLabel}
          </Button>
        )}
      </Card>
    </motion.div>
  );
}
