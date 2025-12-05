/**
 * Virtualized Budget List Component
 * Efficiently renders large lists of budget categories
 */
import { memo, CSSProperties } from 'react';
import { VirtualizedList, VirtualizedListSkeleton } from '@/components/ui/virtualized-list';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BudgetCategory {
  id: string;
  name: string;
  spent: number;
  limit: number;
  icon?: string;
  color?: string;
}

interface VirtualizedBudgetListProps {
  budgets: BudgetCategory[];
  isLoading?: boolean;
  onEndReached?: () => void;
  height?: number;
  onBudgetClick?: (id: string) => void;
}

export const VirtualizedBudgetList = memo(function VirtualizedBudgetList({
  budgets,
  isLoading = false,
  onEndReached,
  height = 400,
  onBudgetClick,
}: VirtualizedBudgetListProps) {
  const renderBudget = (budget: BudgetCategory, index: number, style: CSSProperties) => {
    const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
    const isOverBudget = percentage > 100;
    const isNearLimit = percentage >= 80 && percentage <= 100;

    return (
      <div 
        style={{ ...style, paddingBottom: 8 }} 
        key={budget.id}
        onClick={() => onBudgetClick?.(budget.id)}
        className="cursor-pointer"
      >
        <div className={cn(
          "p-4 rounded-xl border transition-all",
          "bg-card/50 backdrop-blur-sm",
          "hover:bg-card/80 hover:shadow-md",
          isOverBudget && "border-destructive/50",
          isNearLimit && "border-yellow-500/50"
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {budget.icon && (
                <span className="text-xl">{budget.icon}</span>
              )}
              <span className="font-medium text-foreground">{budget.name}</span>
            </div>
            <span className={cn(
              "text-sm font-semibold",
              isOverBudget ? "text-destructive" : "text-muted-foreground"
            )}>
              ${budget.spent.toLocaleString()} / ${budget.limit.toLocaleString()}
            </span>
          </div>
          
          <Progress 
            value={Math.min(percentage, 100)} 
            className={cn(
              "h-2",
              isOverBudget && "[&>div]:bg-destructive",
              isNearLimit && "[&>div]:bg-yellow-500"
            )}
          />
          
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {percentage.toFixed(0)}% used
            </span>
            <span className={cn(
              "text-xs",
              isOverBudget ? "text-destructive" : "text-muted-foreground"
            )}>
              {isOverBudget 
                ? `$${(budget.spent - budget.limit).toLocaleString()} over` 
                : `$${(budget.limit - budget.spent).toLocaleString()} left`
              }
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <VirtualizedList
      items={budgets}
      renderItem={renderBudget}
      itemHeight={100}
      height={height}
      isLoading={isLoading}
      loadingState={<VirtualizedListSkeleton count={4} itemHeight={100} />}
      emptyState={
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="text-4xl mb-4">💰</div>
          <p className="text-muted-foreground">No budgets set up yet.</p>
        </div>
      }
      onEndReached={onEndReached}
    />
  );
});
