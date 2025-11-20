import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'chart' | 'card';
}

export function LoadingSkeleton({ className, variant = 'text' }: LoadingSkeletonProps) {
  if (variant === 'chart') {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        <motion.div
          className="h-6 bg-muted rounded w-1/3"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="h-[200px] bg-muted rounded"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="h-16 bg-muted rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 + i * 0.1 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn("space-y-3 p-4 border rounded-lg", className)}>
        <motion.div
          className="h-5 bg-muted rounded w-2/3"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="h-4 bg-muted rounded w-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="h-4 bg-muted rounded w-5/6"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <motion.div
        className="h-4 bg-muted rounded w-full"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="h-4 bg-muted rounded w-5/6"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="h-4 bg-muted rounded w-4/6"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );
}
