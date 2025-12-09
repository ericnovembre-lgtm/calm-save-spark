import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Repeat, Calendar, TrendingUp, MoreHorizontal } from "lucide-react";
import { RecurringTransaction } from "@/hooks/useRecurringTransactions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RecurringTransactionListProps {
  transactions: RecurringTransaction[];
  isLoading: boolean;
  onCategoryClick?: (category: string) => void;
}

const frequencyLabels: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export function RecurringTransactionList({ 
  transactions, 
  isLoading,
  onCategoryClick 
}: RecurringTransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Repeat className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No recurring transactions detected</p>
        <p className="text-sm">Recurring patterns will appear here once detected from your transaction history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const confidencePercent = tx.confidence * 100;
        const nextDate = tx.expected_date 
          ? new Date(new Date().getFullYear(), new Date().getMonth(), tx.expected_date)
          : null;
        
        // If expected date has passed this month, show next month
        if (nextDate && nextDate < new Date()) {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Repeat className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{tx.merchant}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <Badge 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-accent"
                    onClick={() => onCategoryClick?.(tx.category || 'Uncategorized')}
                  >
                    {tx.category || 'Uncategorized'}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {frequencyLabels[tx.frequency] || tx.frequency}
                  </span>
                  {nextDate && (
                    <span className="text-xs text-muted-foreground">
                      Next: {format(nextDate, 'MMM d')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={confidencePercent} className="w-20 h-1" />
                  <span className="text-xs text-muted-foreground">
                    {confidencePercent.toFixed(0)}% confidence
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-lg tabular-nums text-foreground">
                  ${Math.abs(tx.avg_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">avg. amount</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Transactions</DropdownMenuItem>
                  <DropdownMenuItem>Set Reminder</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Mark as Non-Recurring</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
