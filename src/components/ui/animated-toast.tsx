import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface AnimatedToastProps {
  variant: ToastVariant;
  title: string;
  description?: string;
  progress?: number;
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    className: 'border-green-500/20 bg-green-50 dark:bg-green-950/20',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-500/20 bg-red-50 dark:bg-red-950/20',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  info: {
    icon: Info,
    className: 'border-blue-500/20 bg-blue-50 dark:bg-blue-950/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-500/20 bg-amber-50 dark:bg-amber-950/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
};

/**
 * AnimatedToast - Custom toast component with animations and icons
 * Used for enhanced user feedback throughout the app
 */
export function AnimatedToast({
  variant,
  title,
  description,
  progress = 0,
}: AnimatedToastProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = variantConfig[variant];
  const Icon = config.icon;

  if (prefersReducedMotion) {
    return (
      <div
        className={cn(
          'relative rounded-lg border p-4 shadow-lg backdrop-blur-sm',
          config.className
        )}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn('w-6 h-6 flex-shrink-0', config.iconColor)} />
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground mb-1">{title}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        {progress > 0 && (
          <div
            className="absolute bottom-0 left-0 h-1 bg-primary rounded-full"
            style={{ width: `${100 - progress}%` }}
          />
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative rounded-lg border p-4 shadow-lg backdrop-blur-sm',
        config.className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-6 h-6 flex-shrink-0', config.iconColor)} />
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground mb-1">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      {progress > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-primary rounded-full"
          initial={{ width: '100%' }}
          animate={{ width: `${100 - progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}
