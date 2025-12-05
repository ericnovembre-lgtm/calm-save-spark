import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface StreamingWidgetSkeletonProps {
  isLoading: boolean;
  widgetType?: string;
  children: React.ReactNode;
  className?: string;
  index?: number; // For stagger animation
}

export function StreamingWidgetSkeleton({
  isLoading,
  widgetType = 'default',
  children,
  className,
  index = 0,
}: StreamingWidgetSkeletonProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (!isLoading && !showContent) {
      const timeout = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timeout);
    }
    if (isLoading) {
      setShowContent(false);
    }
  }, [isLoading, showContent]);

  // Stagger delay based on index
  const staggerDelay = index * 0.1;

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ 
              duration: 0.3, 
              delay: prefersReducedMotion ? 0 : staggerDelay,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <SkeletonContent type={widgetType} reduced={prefersReducedMotion} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkeletonContent({ type, reduced }: { type: string; reduced: boolean }) {
  // Enhanced multi-layer shimmer with glow effect
  const shimmerBase = 'relative overflow-hidden';
  const shimmerClass = reduced 
    ? 'bg-muted/50' 
    : 'bg-gradient-to-r from-muted/30 via-muted/60 to-muted/30 animate-shimmer bg-[length:200%_100%]';
  
  const glowOverlay = !reduced && (
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer-glow bg-[length:300%_100%]" />
  );

  // Pulsing progress dots component
  const ProgressDots = () => (
    <div className="flex items-center gap-1 mt-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary/40"
          animate={reduced ? {} : { 
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );

  switch (type) {
    case 'balance_hero':
      return (
        <div className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={cn('h-4 w-24 rounded-md', shimmerBase, shimmerClass)}>{glowOverlay}</div>
            <div className={cn('h-6 w-16 rounded-full', shimmerBase, shimmerClass)}>{glowOverlay}</div>
          </div>
          <div className={cn('h-12 w-48 rounded-lg mb-3', shimmerBase, shimmerClass)}>{glowOverlay}</div>
          <div className="flex items-center gap-3">
            <div className={cn('h-3 w-20 rounded', shimmerBase, shimmerClass)}>{glowOverlay}</div>
            <div className={cn('h-3 w-24 rounded', shimmerBase, shimmerClass)}>{glowOverlay}</div>
          </div>
          <ProgressDots />
        </div>
      );

    case 'goal_progress':
      return (
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn('h-12 w-12 rounded-full', shimmerBase, shimmerClass)}>{glowOverlay}</div>
            <div className="flex-1 space-y-2">
              <div className={cn('h-4 w-28 rounded-md', shimmerBase, shimmerClass)}>{glowOverlay}</div>
              <div className={cn('h-2.5 w-full rounded-full', shimmerBase, shimmerClass)}>{glowOverlay}</div>
            </div>
            <div className={cn('h-8 w-16 rounded-md', shimmerBase, shimmerClass)}>{glowOverlay}</div>
          </div>
          <ProgressDots />
        </div>
      );

    case 'spending_breakdown':
      return (
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <div className={cn('h-5 w-40 rounded-md mb-4', shimmerBase, shimmerClass)}>{glowOverlay}</div>
          <div className="space-y-3">
            {[0.9, 0.7, 0.5, 0.3].map((width, i) => (
              <motion.div 
                key={i} 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={cn('h-8 w-8 rounded-lg', shimmerBase, shimmerClass)}>{glowOverlay}</div>
                <div className={cn('h-3 rounded', shimmerBase, shimmerClass)} style={{ width: `${width * 100}%` }}>{glowOverlay}</div>
                <div className={cn('h-4 w-14 rounded-md ml-auto', shimmerBase, shimmerClass)}>{glowOverlay}</div>
              </motion.div>
            ))}
          </div>
        </div>
      );

    case 'ai_insights':
      return (
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm relative">
          {/* Subtle gradient border glow */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-50 blur-sm" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn('h-6 w-6 rounded-md', shimmerBase, shimmerClass)}>{glowOverlay}</div>
              <div className={cn('h-4 w-20 rounded', shimmerBase, shimmerClass)}>{glowOverlay}</div>
              <div className={cn('h-5 w-12 rounded-full ml-auto', shimmerBase, shimmerClass)}>{glowOverlay}</div>
            </div>
            <div className="space-y-2">
              <div className={cn('h-3 w-full rounded', shimmerBase, shimmerClass)}>{glowOverlay}</div>
              <div className={cn('h-3 w-[85%] rounded', shimmerBase, shimmerClass)}>{glowOverlay}</div>
              <div className={cn('h-3 w-[60%] rounded', shimmerBase, shimmerClass)}>{glowOverlay}</div>
            </div>
            <ProgressDots />
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <div className={cn('h-4 w-28 rounded-md mb-4', shimmerBase, shimmerClass)}>{glowOverlay}</div>
          <div className="space-y-2">
            <div className={cn('h-3 w-full rounded', shimmerBase, shimmerClass)}>{glowOverlay}</div>
            <div className={cn('h-3 w-3/4 rounded', shimmerBase, shimmerClass)}>{glowOverlay}</div>
          </div>
          <ProgressDots />
        </div>
      );
  }
}
