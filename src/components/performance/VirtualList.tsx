/**
 * VirtualList - Generic virtualized list for long data sets
 * Wraps @tanstack/react-virtual for efficient rendering
 */
import { useRef, ReactNode, CSSProperties, useCallback } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface VirtualListProps<T> {
  /** Data items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number, virtualItem: VirtualItem) => ReactNode;
  /** Estimated height of each item (can be function for variable heights) */
  estimateSize: number | ((index: number) => number);
  /** Container height (default: 400) */
  height?: number | string;
  /** Number of items to render outside visible area (default: 5) */
  overscan?: number;
  /** CSS classes for container */
  className?: string;
  /** CSS classes for inner content */
  innerClassName?: string;
  /** Empty state component */
  emptyState?: ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Loading skeleton count */
  loadingCount?: number;
  /** Gap between items in pixels */
  gap?: number;
  /** Callback when scrolling near end */
  onEndReached?: () => void;
  /** Threshold for triggering onEndReached (0-1, default: 0.8) */
  endReachedThreshold?: number;
  /** Keyboard navigation enabled */
  enableKeyboardNav?: boolean;
  /** Get unique key for item */
  getItemKey?: (index: number, item: T) => string | number;
}

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize,
  height = 400,
  overscan = 5,
  className,
  innerClassName,
  emptyState,
  isLoading = false,
  loadingCount = 5,
  gap = 0,
  onEndReached,
  endReachedThreshold = 0.8,
  enableKeyboardNav = true,
  getItemKey,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const focusedIndex = useRef<number>(-1);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof estimateSize === 'number' 
      ? () => estimateSize 
      : estimateSize,
    overscan,
    gap,
    getItemKey: getItemKey 
      ? (index) => getItemKey(index, items[index])
      : undefined,
  });

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!onEndReached || !parentRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage >= endReachedThreshold) {
      onEndReached();
    }
  }, [onEndReached, endReachedThreshold]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enableKeyboardNav || items.length === 0) return;

    const virtualItems = virtualizer.getVirtualItems();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusedIndex.current = Math.min(focusedIndex.current + 1, items.length - 1);
        virtualizer.scrollToIndex(focusedIndex.current, { align: 'auto' });
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusedIndex.current = Math.max(focusedIndex.current - 1, 0);
        virtualizer.scrollToIndex(focusedIndex.current, { align: 'auto' });
        break;
      case 'Home':
        e.preventDefault();
        focusedIndex.current = 0;
        virtualizer.scrollToIndex(0, { align: 'start' });
        break;
      case 'End':
        e.preventDefault();
        focusedIndex.current = items.length - 1;
        virtualizer.scrollToIndex(items.length - 1, { align: 'end' });
        break;
    }
  }, [enableKeyboardNav, items.length, virtualizer]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)} style={{ height }}>
        {Array.from({ length: loadingCount }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-full rounded-lg" 
            style={{ height: typeof estimateSize === 'number' ? estimateSize : 64 }} 
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (items.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div
      ref={parentRef}
      className={cn(
        'overflow-auto scrollbar-thin scrollbar-thumb-muted focus:outline-none',
        className
      )}
      style={{ height }}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      tabIndex={enableKeyboardNav ? 0 : undefined}
      role="listbox"
      aria-label="Virtual list"
    >
      <div
        className={innerClassName}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          const isFocused = enableKeyboardNav && focusedIndex.current === virtualItem.index;
          
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              role="option"
              aria-selected={isFocused}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index, virtualItem)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * VirtualGrid - Virtualized grid layout
 */
export interface VirtualGridProps<T> extends Omit<VirtualListProps<T>, 'estimateSize'> {
  /** Number of columns */
  columns: number;
  /** Row height */
  rowHeight: number;
}

export function VirtualGrid<T>({
  items,
  columns,
  rowHeight,
  renderItem,
  getItemKey,
  ...props
}: VirtualGridProps<T>) {
  // Group items into rows
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }

  return (
    <VirtualList
      {...props}
      items={rows}
      estimateSize={rowHeight}
      getItemKey={undefined}
      renderItem={(row, rowIndex, virtualItem) => (
        <div className="flex gap-2">
          {row.map((item, colIndex) => {
            const itemIndex = rowIndex * columns + colIndex;
            return (
              <div key={colIndex} className="flex-1">
                {renderItem(item, itemIndex, virtualItem)}
              </div>
            );
          })}
        </div>
      )}
    />
  );
}
