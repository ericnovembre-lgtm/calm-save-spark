import { useRef, useEffect, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useOptimizedTransactions } from "@/hooks/useOptimizedTransactions";
import { TransactionCard } from "./TransactionCard";
import { LoadingState } from "@/components/LoadingState";
import { DollarSign, Filter } from "lucide-react";
import { useMerchantLogoPreload } from "@/hooks/useMerchantLogoPreload";
import { usePageMemo } from "@/lib/performance-utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ANIMATION_DURATION, STAGGER_DELAY } from "@/lib/animation-constants";

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
    count: hasNextPage ? allTransactions.length + 1 : allTransactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88, // More accurate estimation based on TransactionCard
    overscan: 3, // Reduced overscan for better performance
    measureElement: (element) => element.getBoundingClientRect().height,
  });

  // Infinite scroll trigger
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) return;

    if (
      lastItem.index >= allTransactions.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allTransactions.length,
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
              const isLoaderRow = virtualRow.index > allTransactions.length - 1;
              const transaction = allTransactions[virtualRow.index];

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
                  {isLoaderRow ? (
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
                    <MemoizedTransactionCard transaction={transaction} />
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
