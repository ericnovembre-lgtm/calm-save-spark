import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SkeletonCardProps {
  className?: string;
  variant?: 'balance' | 'goal' | 'chart' | 'insight' | 'list';
}

export function SkeletonCard({ className, variant = 'balance' }: SkeletonCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const shimmerVariants = {
    animate: prefersReducedMotion ? {} : {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear' as const
      }
    }
  };

  const pulseVariants = {
    animate: prefersReducedMotion ? {} : {
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    }
  };

  const renderBalanceSkeleton = () => (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="h-4 w-24 rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
            variants={shimmerVariants}
            animate="animate"
          />
          <motion.div
            className="h-8 w-8 rounded-full bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
            variants={shimmerVariants}
            animate="animate"
          />
        </div>
        <motion.div
          className="h-12 w-48 rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
          variants={shimmerVariants}
          animate="animate"
        />
        <div className="flex items-center gap-2">
          <motion.div
            className="h-6 w-32 rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
            variants={shimmerVariants}
            animate="animate"
          />
          <motion.div
            className="h-6 w-20 rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
            variants={shimmerVariants}
            animate="animate"
          />
        </div>
        <motion.div
          className="h-24 w-full rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
          variants={shimmerVariants}
          animate="animate"
        />
      </div>
    </Card>
  );

  const renderGoalSkeleton = () => (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <motion.div
              className="h-6 w-32 rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
              variants={shimmerVariants}
              animate="animate"
            />
            <motion.div
              className="h-4 w-48 rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
              variants={shimmerVariants}
              animate="animate"
            />
          </div>
          <motion.div
            className="h-20 w-20 rounded-full bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
            variants={shimmerVariants}
            animate="animate"
          />
        </div>
      </div>
    </Card>
  );

  const renderChartSkeleton = () => (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <motion.div
          className="h-6 w-40 rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
          variants={shimmerVariants}
          animate="animate"
        />
        <motion.div
          className="h-64 w-full rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
          variants={shimmerVariants}
          animate="animate"
        />
        <div className="flex justify-between">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="h-4 w-16 rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
              variants={shimmerVariants}
              animate="animate"
            />
          ))}
        </div>
      </div>
    </Card>
  );

  const renderInsightSkeleton = () => (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="h-10 w-10 rounded-full bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
            variants={shimmerVariants}
            animate="animate"
          />
          <div className="space-y-2 flex-1">
            <motion.div
              className="h-4 w-32 rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
              variants={shimmerVariants}
              animate="animate"
            />
            <motion.div
              className="h-3 w-full rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
              variants={shimmerVariants}
              animate="animate"
            />
          </div>
        </div>
        <motion.div
          className="h-20 w-full rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
          variants={shimmerVariants}
          animate="animate"
        />
      </div>
    </Card>
  );

  const renderListSkeleton = () => (
    <Card className={cn("p-6", className)}>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <motion.div
              className="h-10 w-10 rounded-full bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
              variants={shimmerVariants}
              animate="animate"
            />
            <div className="flex-1 space-y-2">
              <motion.div
                className="h-4 w-3/4 rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
                variants={shimmerVariants}
                animate="animate"
              />
              <motion.div
                className="h-3 w-1/2 rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
                variants={shimmerVariants}
                animate="animate"
              />
            </div>
            <motion.div
              className="h-6 w-16 rounded bg-gradient-to-r from-muted via-muted-foreground/20 to-muted bg-[length:200%_100%]"
              variants={shimmerVariants}
              animate="animate"
            />
          </div>
        ))}
      </div>
    </Card>
  );

  switch (variant) {
    case 'balance':
      return renderBalanceSkeleton();
    case 'goal':
      return renderGoalSkeleton();
    case 'chart':
      return renderChartSkeleton();
    case 'insight':
      return renderInsightSkeleton();
    case 'list':
      return renderListSkeleton();
    default:
      return renderBalanceSkeleton();
  }
}
