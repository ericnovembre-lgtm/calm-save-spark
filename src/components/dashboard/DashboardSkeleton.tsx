import { motion } from 'framer-motion';
import { HeroSkeleton } from './skeletons/HeroSkeleton';
import { BriefingSkeleton } from './skeletons/BriefingSkeleton';
import { ActionsSkeleton } from './skeletons/ActionsSkeleton';
import { BalanceSkeleton } from './skeletons/BalanceSkeleton';
import { GoalsSkeleton } from './skeletons/GoalsSkeleton';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 pb-20">
      {/* Header with streak, level, and sentiment */}
      <motion.div 
        className="flex items-center gap-4 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Skeleton className="h-10 w-48 rounded-xl animate-pulse" style={{ animationDelay: '0ms' }} />
        <Skeleton className="h-10 w-32 rounded-xl animate-pulse" style={{ animationDelay: '100ms' }} />
        <Skeleton className="h-8 w-24 rounded-full ml-auto animate-pulse" style={{ animationDelay: '200ms' }} />
      </motion.div>

      {/* Dynamic Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeroSkeleton />
      </motion.div>

      {/* Daily Briefing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <BriefingSkeleton />
      </motion.div>

      {/* Smart Actions Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <ActionsSkeleton />
      </motion.div>

      {/* Welcome/Dynamic message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="p-8 backdrop-blur-xl bg-card/80 border-border/40">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 animate-pulse" style={{ animationDelay: '0ms' }} />
            <Skeleton className="h-5 w-full max-w-2xl animate-pulse" style={{ animationDelay: '100ms' }} />
          </div>
        </Card>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <BalanceSkeleton />
      </motion.div>

      {/* Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <GoalsSkeleton />
      </motion.div>

      {/* Additional cards grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.4 + i * 0.05,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <Card className="p-6 h-64 backdrop-blur-xl bg-card/80 border-border/40">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
                  <Skeleton className="h-8 w-8 rounded-full animate-pulse" style={{ animationDelay: `${i * 50 + 100}ms` }} />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full animate-pulse" style={{ animationDelay: `${i * 50 + 150}ms` }} />
                  <Skeleton className="h-4 w-5/6 animate-pulse" style={{ animationDelay: `${i * 50 + 200}ms` }} />
                  <Skeleton className="h-4 w-4/6 animate-pulse" style={{ animationDelay: `${i * 50 + 250}ms` }} />
                </div>
                <Skeleton className="h-32 w-full rounded-lg animate-pulse" style={{ animationDelay: `${i * 50 + 300}ms` }} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
