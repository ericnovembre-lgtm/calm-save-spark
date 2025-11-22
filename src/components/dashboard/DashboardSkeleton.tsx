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
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-8 w-24 rounded-full ml-auto" />
      </div>

      {/* Dynamic Hero Section */}
      <HeroSkeleton />

      {/* Daily Briefing */}
      <BriefingSkeleton />

      {/* Smart Actions Row */}
      <ActionsSkeleton />

      {/* Welcome/Dynamic message */}
      <Card className="p-8 backdrop-blur-xl bg-card/80 border-border/40">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
      </Card>

      {/* Balance Card */}
      <BalanceSkeleton />

      {/* Goals Section */}
      <GoalsSkeleton />

      {/* Additional cards grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <Card className="p-6 h-64 backdrop-blur-xl bg-card/80 border-border/40">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
