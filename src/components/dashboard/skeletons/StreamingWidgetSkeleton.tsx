import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface StreamingWidgetSkeletonProps {
  isLoading: boolean;
  widgetType?: string;
  children: React.ReactNode;
  className?: string;
}

export function StreamingWidgetSkeleton({
  isLoading,
  widgetType = 'default',
  children,
  className,
}: StreamingWidgetSkeletonProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (!isLoading && !showContent) {
      // Delay content reveal for smooth transition
      const timeout = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timeout);
    }
    if (isLoading) {
      setShowContent(false);
    }
  }, [isLoading, showContent]);

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
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
  const shimmerClass = reduced 
    ? 'bg-white/5' 
    : 'bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-shimmer bg-[length:200%_100%]';

  switch (type) {
    case 'balance_hero':
      return (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className={cn('h-4 w-24 rounded mb-4', shimmerClass)} />
          <div className={cn('h-10 w-40 rounded mb-2', shimmerClass)} />
          <div className={cn('h-3 w-32 rounded', shimmerClass)} />
        </div>
      );

    case 'goal_progress':
      return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn('h-10 w-10 rounded-full', shimmerClass)} />
            <div className="flex-1">
              <div className={cn('h-4 w-32 rounded mb-2', shimmerClass)} />
              <div className={cn('h-2 w-full rounded', shimmerClass)} />
            </div>
          </div>
        </div>
      );

    case 'spending_breakdown':
      return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className={cn('h-4 w-36 rounded mb-4', shimmerClass)} />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn('h-6 w-6 rounded', shimmerClass)} />
                <div className={cn('h-3 flex-1 rounded', shimmerClass)} />
                <div className={cn('h-3 w-16 rounded', shimmerClass)} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'ai_insights':
      return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn('h-5 w-5 rounded', shimmerClass)} />
            <div className={cn('h-4 w-24 rounded', shimmerClass)} />
          </div>
          <div className="space-y-2">
            <div className={cn('h-3 w-full rounded', shimmerClass)} />
            <div className={cn('h-3 w-4/5 rounded', shimmerClass)} />
            <div className={cn('h-3 w-3/5 rounded', shimmerClass)} />
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className={cn('h-4 w-28 rounded mb-4', shimmerClass)} />
          <div className="space-y-2">
            <div className={cn('h-3 w-full rounded', shimmerClass)} />
            <div className={cn('h-3 w-3/4 rounded', shimmerClass)} />
          </div>
        </div>
      );
  }
}

// Add shimmer animation to tailwind
// In index.css: @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
// .animate-shimmer { animation: shimmer 2s infinite }
