import { useRef, useEffect, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useOptimizedTransactions } from "@/hooks/useOptimizedTransactions";
import { TransactionCard } from "./TransactionCard";
import { SectionHeader } from "./SectionHeader";
import { LoadingState } from "@/components/LoadingState";
import { DollarSign, Filter } from "lucide-react";
import { useMerchantLogoPreload } from "@/hooks/useMerchantLogoPreload";
import { usePageMemo } from "@/lib/performance-utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ANIMATION_DURATION, STAGGER_DELAY } from "@/lib/animation-constants";
import { differenceInDays, format } from "date-fns";

interface VirtualizedTransactionListProps {
  filters?: {
    category?: string;
    merchant?: string;
    amountMin?: number;
    amountMax?: number;
    dateRange?: { start: string; end: string };
    searchQuery?: string;
  };
  onClearFilters?: () => void;
}

// Memoized transaction card for better re-render performance
const MemoizedTransactionCard = memo(TransactionCard, (prev, next) => {
  return prev.transaction.id === next.transaction.id;
});

export const VirtualizedTransactionList = memo(function VirtualizedTransactionList({ 
  filters,
  onClearFilters
}: VirtualizedTransactionListProps) {
  const prefersReducedMotion = useReducedMotion();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useOptimizedTransactions(filters);

  const parentRef = useRef<HTMLDivElement>(null);

  // Memoize flattened transactions array
  const allTransactions = usePageMemo(
    () => data?.pages.flatMap(page => page.transactions) ?? [],
    [data?.pages]
  );

  // Group transactions by time period
  const groupedTransactions = usePageMemo(() => {
    const groups: { title: string; transactions: any[]; total: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groupMap: Record<string, any[]> = {};

    allTransactions.forEach((tx) => {
      const txDate = new Date(tx.transaction_date);
      txDate.setHours(0, 0, 0, 0);
      const diffDays = differenceInDays(today, txDate);

      let groupKey: string;
      if (diffDays === 0) groupKey = 'Today';
      else if (diffDays === 1) groupKey = 'Yesterday';
      else if (diffDays <= 7) groupKey = 'This Week';
      else if (diffDays <= 30) groupKey = 'This Month';
      else groupKey = format(txDate, 'MMMM yyyy');

      if (!groupMap[groupKey]) groupMap[groupKey] = [];
      groupMap[groupKey].push(tx);
    });

    // Convert to array and calculate totals
    Object.entries(groupMap).forEach(([title, transactions]) => {
      const total = transactions.reduce(
        (sum, tx) => sum + parseFloat(String(tx.amount)),
        0
      );
      groups.push({ title, transactions, total });
    });

    return groups;
  }, [allTransactions]);

  // Flatten grouped data for virtualizer (include headers)
  const virtualItems = usePageMemo(() => {
    const items: Array<{ type: 'header' | 'transaction'; data: any; groupTitle?: string }> = [];
    
    groupedTransactions.forEach((group) => {
      items.push({ 
        type: 'header', 
        data: { title: group.title, count: group.transactions.length, total: group.total } 
      });
      group.transactions.forEach((tx) => {
        items.push({ type: 'transaction', data: tx, groupTitle: group.title });
      });
    });

    if (hasNextPage) {
      items.push({ type: 'transaction', data: { isLoader: true } });
    }

    return items;
  }, [groupedTransactions, hasNextPage]);

  // Memoize visible merchants for logo preloading
  const visibleMerchants = usePageMemo(() => 
    allTransactions
      .slice(0, 50)
      .map(t => t.merchant)
      .filter(Boolean) as string[],
    [allTransactions]
  );
  
  useMerchantLogoPreload(visibleMerchants);

  // Optimized virtualizer with better size estimation
  const rowVirtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = virtualItems[index];
      return item.type === 'header' ? 48 : 88;
    },
    overscan: 3,
    measureElement: (element) => element.getBoundingClientRect().height,
  });

  // Infinite scroll trigger
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) return;

    if (
      lastItem.index >= virtualItems.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    virtualItems.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  if (isLoading) {
    return <LoadingState />;
  }

  // Check if filters are applied
  const hasFilters = filters && (
    filters.category || 
    filters.merchant || 
    filters.amountMin !== undefined || 
    filters.amountMax !== undefined || 
    filters.dateRange || 
    filters.searchQuery
  );

  if (allTransactions.length === 0) {
    if (hasFilters) {
      // No results with filters applied
      return (
        <EmptyState
          icon={Filter}
          title="No transactions match your filters"
          description="Try adjusting your search criteria or clear all filters to see your transactions."
          actionLabel={onClearFilters ? "Clear All Filters" : undefined}
          onAction={onClearFilters}
          variant="transactions"
        />
      );
    }
    
    // No transactions at all
    return (
      <EmptyState
        icon={DollarSign}
        title="No transactions yet"
        description="Connect your bank account or manually add transactions to get started tracking your spending."
        variant="transactions"
      />
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-300px)] overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
          <AnimatePresence mode="popLayout">
            {rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
              const item = virtualItems[virtualRow.index];

              if (!item) return null;

              return (
                <motion.div
                  key={virtualRow.key}
                  initial={prefersReducedMotion ? undefined : { 
                    opacity: 0, 
                    y: 20 
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0 
                  }}
                  exit={prefersReducedMotion ? undefined : { 
                    opacity: 0, 
                    scale: 0.95 
                  }}
                  transition={{
                    duration: ANIMATION_DURATION.normal / 1000,
                    delay: prefersReducedMotion ? 0 : Math.min(index * (STAGGER_DELAY.list / 1000), 0.3),
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {item.type === 'header' ? (
                    <SectionHeader
                      title={item.data.title}
                      count={item.data.count}
                      total={item.data.total}
                    />
                  ) : item.data.isLoader ? (
                    hasNextPage ? (
                      <motion.div 
                        className="p-4 text-center text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        Loading more...
                      </motion.div>
                    ) : null
                  ) : (
                    <MemoizedTransactionCard transaction={item.data} />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
      </div>
    </div>
  );
}, (prev, next) => {
  // Custom comparison to prevent unnecessary re-renders
  return JSON.stringify(prev.filters) === JSON.stringify(next.filters);
});
