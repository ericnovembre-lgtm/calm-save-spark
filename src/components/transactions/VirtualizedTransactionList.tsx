import { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useVirtualTransactions } from "@/hooks/useVirtualTransactions";
import { TransactionCard } from "./TransactionCard";
import { LoadingState } from "@/components/LoadingState";
import { DollarSign } from "lucide-react";
import { useMerchantLogoPreload } from "@/hooks/useMerchantLogoPreload";

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

export function VirtualizedTransactionList({ filters }: VirtualizedTransactionListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useVirtualTransactions(filters);

  const parentRef = useRef<HTMLDivElement>(null);

  // Flatten all pages into single array
  const allTransactions = data?.pages.flatMap(page => page.transactions) ?? [];

  // Preload merchant logos for first 50 visible transactions
  const visibleMerchants = allTransactions
    .slice(0, 50)
    .map(t => t.merchant)
    .filter(Boolean) as string[];
  
  useMerchantLogoPreload(visibleMerchants);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allTransactions.length + 1 : allTransactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
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
                <TransactionCard transaction={transaction} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
