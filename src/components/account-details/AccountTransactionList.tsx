import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { AccountTransaction } from "@/hooks/useAccountTransactions";

interface AccountTransactionListProps {
  transactions: AccountTransaction[];
  isLoading: boolean;
}

export function AccountTransactionList({ transactions, isLoading }: AccountTransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No transactions found for this account</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {transactions.map((tx) => {
        const isIncome = tx.amount > 0;
        
        return (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isIncome ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                {isIncome ? (
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-rose-500" />
                )}
              </div>
              <div>
              <p className="font-medium text-foreground line-clamp-1">
                  {tx.merchant || tx.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{format(new Date(tx.transaction_date), 'MMM d, yyyy')}</span>
                  {tx.category && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs py-0 px-1.5">
                        {tx.category}
                      </Badge>
                    </>
                  )}
                  {tx.pending && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <p className={`font-semibold tabular-nums ${isIncome ? 'text-emerald-500' : 'text-foreground'}`}>
              {isIncome ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        );
      })}
    </div>
  );
}
