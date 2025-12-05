import { ReactNode, useEffect } from 'react';
import { Reorder, useDragControls, motion } from 'framer-motion';
import { GripVertical, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useWidgetReorder } from '@/hooks/useWidgetReorder';
import { useWidgetPreferences } from '@/hooks/useWidgetPreferences';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { WidgetPinButton, PinnedIndicator } from './WidgetPinButton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DraggableWidgetGridProps {
  widgetIds: string[];
  renderWidget: (widgetId: string, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
}

export function DraggableWidgetGrid({
  widgetIds,
  renderWidget,
  className = '',
  itemClassName = '',
}: DraggableWidgetGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const { preferences, resetPreferences } = useWidgetPreferences();
  const {
    items,
    handleReorder,
    initializeOrder,
    reorderState,
    startDrag,
    endDrag,
    dragAnimationConfig,
    getOrderedWidgets,
  } = useWidgetReorder(widgetIds);

  // Initialize order when widget IDs change
  useEffect(() => {
    initializeOrder(widgetIds);
  }, [widgetIds, initializeOrder]);

  const orderedWidgets = getOrderedWidgets(items.length > 0 ? items : widgetIds);
  const hiddenCount = preferences.hiddenWidgets.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Hidden widgets indicator */}
      {hiddenCount > 0 && (
        <HiddenWidgetsDropdown 
          hiddenWidgets={preferences.hiddenWidgets}
          onReset={resetPreferences}
        />
      )}

      {/* Reorderable grid */}
      <Reorder.Group
        axis="y"
        values={orderedWidgets}
        onReorder={handleReorder}
        className="space-y-4"
        layoutScroll
      >
        {orderedWidgets.map((widgetId, index) => (
          <DraggableWidgetItem
            key={widgetId}
            widgetId={widgetId}
            index={index}
            isDragging={reorderState.draggedId === widgetId}
            onDragStart={() => startDrag(widgetId)}
            onDragEnd={endDrag}
            dragAnimationConfig={dragAnimationConfig}
            prefersReducedMotion={prefersReducedMotion}
            className={itemClassName}
          >
            {renderWidget(widgetId, index)}
          </DraggableWidgetItem>
        ))}
      </Reorder.Group>
    </div>
  );
}

interface DraggableWidgetItemProps {
  widgetId: string;
  index: number;
  children: ReactNode;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  dragAnimationConfig: any;
  prefersReducedMotion: boolean;
  className?: string;
}

function DraggableWidgetItem({
  widgetId,
  index,
  children,
  isDragging,
  onDragStart,
  onDragEnd,
  dragAnimationConfig,
  prefersReducedMotion,
  className = '',
}: DraggableWidgetItemProps) {
  const dragControls = useDragControls();
  const { isPinned } = useWidgetPreferences();
  const pinned = isPinned(widgetId);

  return (
    <Reorder.Item
      value={widgetId}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      layout={prefersReducedMotion ? undefined : "position"}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        ...(isDragging ? dragAnimationConfig : {}),
      }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -20 }}
      transition={{ 
        duration: prefersReducedMotion ? 0 : 0.3,
        delay: index * 0.05,
      }}
      className={cn(
        'relative group',
        isDragging && 'z-50',
        className
      )}
    >
      {/* Pinned indicator */}
      <PinnedIndicator isPinned={pinned} />

      {/* Drag handle - visible on hover */}
      <motion.div
        className={cn(
          'absolute -left-10 top-1/2 -translate-y-1/2',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          'cursor-grab active:cursor-grabbing'
        )}
        onPointerDown={(e) => dragControls.start(e)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="p-2 rounded-lg bg-muted/80 hover:bg-muted backdrop-blur-sm">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </motion.div>

      {/* Pin button - visible on hover */}
      <div className={cn(
        'absolute top-2 right-2 z-10',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
      )}>
        <WidgetPinButton widgetId={widgetId} />
      </div>

      {/* Widget content */}
      <div className={cn(
        'transition-shadow duration-200',
        isDragging && 'shadow-2xl'
      )}>
        {children}
      </div>
    </Reorder.Item>
  );
}

// Dropdown to show/restore hidden widgets
interface HiddenWidgetsDropdownProps {
  hiddenWidgets: string[];
  onReset: () => void;
}

function HiddenWidgetsDropdown({ hiddenWidgets, onReset }: HiddenWidgetsDropdownProps) {
  const { toggleHide } = useWidgetPreferences();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <EyeOff className="w-4 h-4" />
          {hiddenWidgets.length} hidden widget{hiddenWidgets.length !== 1 ? 's' : ''}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {hiddenWidgets.map((widgetId) => (
          <DropdownMenuItem
            key={widgetId}
            onClick={() => toggleHide(widgetId)}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Show {formatWidgetName(widgetId)}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onReset} className="gap-2 text-muted-foreground">
          <RotateCcw className="w-4 h-4" />
          Reset all preferences
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper to format widget ID to display name
function formatWidgetName(widgetId: string): string {
  return widgetId
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default DraggableWidgetGrid;
