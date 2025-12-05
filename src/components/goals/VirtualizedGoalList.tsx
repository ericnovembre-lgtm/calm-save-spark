/**
 * Virtualized Goal List Component
 * Efficiently renders large lists of goals with infinite scroll
 */
import { memo, CSSProperties } from 'react';
import { VirtualizedList, VirtualizedListSkeleton } from '@/components/ui/virtualized-list';
import { GoalProgressCard } from '@/components/dashboard/GoalProgressCard';

interface Goal {
  id: string;
  name: string;
  current_amount: number;
  target_amount: number;
  icon?: string;
}

interface VirtualizedGoalListProps {
  goals: Goal[];
  isLoading?: boolean;
  onEndReached?: () => void;
  height?: number;
  emptyMessage?: string;
}

export const VirtualizedGoalList = memo(function VirtualizedGoalList({
  goals,
  isLoading = false,
  onEndReached,
  height = 400,
  emptyMessage = 'No goals yet. Create your first goal!',
}: VirtualizedGoalListProps) {
  const renderGoal = (goal: Goal, index: number, style: CSSProperties) => (
    <div style={{ ...style, paddingBottom: 12 }} key={goal.id}>
      <GoalProgressCard
        id={goal.id}
        name={goal.name}
        currentAmount={goal.current_amount}
        targetAmount={goal.target_amount}
        icon={goal.icon}
      />
    </div>
  );

  return (
    <VirtualizedList
      items={goals}
      renderItem={renderGoal}
      itemHeight={140}
      height={height}
      isLoading={isLoading}
      loadingState={<VirtualizedListSkeleton count={3} itemHeight={140} />}
      emptyState={
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      }
      onEndReached={onEndReached}
      endReachedThreshold={0.8}
    />
  );
});
