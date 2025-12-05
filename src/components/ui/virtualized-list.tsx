/**
 * VirtualizedList - Generic virtual scrolling component
 * Uses @tanstack/react-virtual for efficient rendering of large lists
 */
import { useRef, ReactNode, CSSProperties } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, style: CSSProperties) => ReactNode;
  itemHeight: number | ((index: number) => number);
  height?: number;
  className?: string;
  emptyState?: ReactNode;
  loadingState?: ReactNode;
  isLoading?: boolean;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  height = 400,
  className,
  emptyState,
  loadingState,
  isLoading = false,
  onEndReached,
  endReachedThreshold = 0.8,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof itemHeight === 'number' 
      ? () => itemHeight 
      : itemHeight,
    overscan: 5,
  });

  // Handle scroll for infinite loading
  const handleScroll = () => {
    if (!onEndReached || !parentRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage >= endReachedThreshold) {
      onEndReached();
    }
  };

  if (isLoading && loadingState) {
    return <>{loadingState}</>;
  }

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto scrollbar-thin scrollbar-thumb-muted', className)}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index, {
                height: virtualItem.size,
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Loading skeleton for virtualized lists
export function VirtualizedListSkeleton({ 
  count = 5, 
  itemHeight = 64,
  className 
}: { 
  count?: number; 
  itemHeight?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="w-full rounded-lg" 
          style={{ height: itemHeight }} 
        />
      ))}
    </div>
  );
}
