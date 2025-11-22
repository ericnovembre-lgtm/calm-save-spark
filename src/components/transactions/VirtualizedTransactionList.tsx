import { useRef, useEffect, useMemo, memo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useOptimizedTransactions } from "@/hooks/useOptimizedTransactions";
import { TransactionCard } from "./TransactionCard";
import { LoadingState } from "@/components/LoadingState";
import { DollarSign } from "lucide-react";
import { useMerchantLogoPreload } from "@/hooks/useMerchantLogoPreload";
import { usePageMemo } from "@/lib/performance-utils";

interface VirtualizedTransactionListProps {
  filters?: {
    category?: string;
    merchant?: string;
    amountMin?: number;
    amountMax?: number;
    dateRange?: { start: string; end: string };
    searchQuery?: string;
  };
}

// Memoized transaction card for better re-render performance
const MemoizedTransactionCard = memo(TransactionCard, (prev, next) => {
  return prev.transaction.id === next.transaction.id;
});

export const VirtualizedTransactionList = memo(function VirtualizedTransactionList({ 
  filters 
}: VirtualizedTransactionListProps) {
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

  if (allTransactions.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
        <p className="text-muted-foreground">No transactions found</p>
      </div>
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
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index > allTransactions.length - 1;
          const transaction = allTransactions[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
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
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading more...
                  </div>
                ) : null
              ) : (
                <MemoizedTransactionCard transaction={transaction} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}, (prev, next) => {
  // Custom comparison to prevent unnecessary re-renders
  return JSON.stringify(prev.filters) === JSON.stringify(next.filters);
});
