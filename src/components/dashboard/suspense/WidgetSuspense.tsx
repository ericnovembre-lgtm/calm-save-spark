/**
 * Widget-specific Suspense Boundaries
 * Matching skeleton shapes for each widget type
 */
import { Suspense, ReactNode, memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/ui/glass-card';
import { SuspenseBoundary } from '@/components/ui/suspense-boundary';

type WidgetType = 
  | 'balance_hero'
  | 'goal_progress'
  | 'spending_breakdown'
  | 'ai_insights'
  | 'upcoming_bills'
  | 'credit_score'
  | 'portfolio'
  | 'debt_tracker'
  | 'default';

interface WidgetSuspenseProps {
  children: ReactNode;
  type?: WidgetType;
  onError?: (error: Error) => void;
}

export const WidgetSuspense = memo(function WidgetSuspense({
  children,
  type = 'default',
  onError,
}: WidgetSuspenseProps) {
  const fallback = getWidgetSkeleton(type);

  return (
    <SuspenseBoundary
      fallback={fallback}
      onError={onError}
    >
      {children}
    </SuspenseBoundary>
  );
});

function getWidgetSkeleton(type: WidgetType): ReactNode {
  switch (type) {
    case 'balance_hero':
      return <BalanceHeroSkeleton />;
    case 'goal_progress':
      return <GoalProgressSkeleton />;
    case 'spending_breakdown':
      return <SpendingBreakdownSkeleton />;
    case 'ai_insights':
      return <AIInsightsSkeleton />;
    case 'upcoming_bills':
      return <UpcomingBillsSkeleton />;
    case 'credit_score':
      return <CreditScoreSkeleton />;
    case 'portfolio':
      return <PortfolioSkeleton />;
    case 'debt_tracker':
      return <DebtTrackerSkeleton />;
    default:
      return <DefaultWidgetSkeleton />;
  }
}

// Skeleton Components
const BalanceHeroSkeleton = memo(function BalanceHeroSkeleton() {
  return (
    <GlassCard className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-48" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <Skeleton className="h-8 w-32 rounded-xl" />
      <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-2 gap-6">
        <div>
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </GlassCard>
  );
});

const GoalProgressSkeleton = memo(function GoalProgressSkeleton() {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </GlassCard>
  );
});

const SpendingBreakdownSkeleton = memo(function SpendingBreakdownSkeleton() {
  return (
    <GlassCard className="p-6">
      <Skeleton className="h-5 w-40 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

const AIInsightsSkeleton = memo(function AIInsightsSkeleton() {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-28 mt-1" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-10 w-full mt-4 rounded-lg" />
    </GlassCard>
  );
});

const UpcomingBillsSkeleton = memo(function UpcomingBillsSkeleton() {
  return (
    <GlassCard className="p-6">
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

const CreditScoreSkeleton = memo(function CreditScoreSkeleton() {
  return (
    <GlassCard className="p-6">
      <Skeleton className="h-5 w-28 mb-4" />
      <div className="flex items-center justify-center">
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4 mx-auto" />
      </div>
    </GlassCard>
  );
});

const PortfolioSkeleton = memo(function PortfolioSkeleton() {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-3 w-16 mx-auto" />
            <Skeleton className="h-5 w-12 mx-auto mt-1" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

const DebtTrackerSkeleton = memo(function DebtTrackerSkeleton() {
  return (
    <GlassCard className="p-6">
      <Skeleton className="h-5 w-28 mb-4" />
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

const DefaultWidgetSkeleton = memo(function DefaultWidgetSkeleton() {
  return (
    <GlassCard className="p-6">
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </GlassCard>
  );
});

export {
  BalanceHeroSkeleton,
  GoalProgressSkeleton,
  SpendingBreakdownSkeleton,
  AIInsightsSkeleton,
  UpcomingBillsSkeleton,
  CreditScoreSkeleton,
  PortfolioSkeleton,
  DebtTrackerSkeleton,
  DefaultWidgetSkeleton,
};
