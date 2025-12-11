import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TransactionHit } from '@/lib/algolia-client';

interface TransactionSearchResultsProps {
  hits: TransactionHit[];
  isLoading?: boolean;
  query?: string;
  onSelect?: (transaction: TransactionHit) => void;
  className?: string;
}

export function TransactionSearchResults({
  hits,
  isLoading = false,
  query = '',
  onSelect,
  className,
}: TransactionSearchResultsProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-muted/50 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (hits.length === 0 && query) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "flex flex-col items-center justify-center py-8 text-center",
          className
        )}
      >
        <Search className="w-10 h-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          No transactions found for "{query}"
        </p>
      </motion.div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <AnimatePresence mode="popLayout">
        {hits.map((hit, index) => {
          const isExpense = hit.amount < 0;
          
          return (
            <motion.button
              key={hit.objectID}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onSelect?.(hit)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg",
                "bg-card/50 hover:bg-card/80",
                "border border-border/30 hover:border-border/50",
                "transition-all duration-200",
                "text-left group"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                  isExpense 
                    ? "bg-destructive/10 text-destructive" 
                    : "bg-emerald-500/10 text-emerald-500"
                )}
              >
                {isExpense ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownLeft className="w-4 h-4" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {hit.merchant || 'Unknown Merchant'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {hit.category || 'Uncategorized'} • {format(new Date(hit.transaction_date), 'MMM d, yyyy')}
                </p>
              </div>

              {/* Amount */}
              <div className="flex-shrink-0 text-right">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isExpense ? "text-destructive" : "text-emerald-500"
                  )}
                >
                  {isExpense ? '-' : '+'}${Math.abs(hit.amount).toFixed(2)}
                </p>
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
