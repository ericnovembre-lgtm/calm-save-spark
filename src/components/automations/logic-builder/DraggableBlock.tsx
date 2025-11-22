import { motion } from "framer-motion";
import { useDrag } from "@use-gesture/react";
import { X, Link2 } from "lucide-react";
import { Block } from "@/hooks/useLogicBlockBuilder";
import { cn } from "@/lib/utils";

interface DraggableBlockProps {
  block: Block;
  isSelected: boolean;
  isConnecting: boolean;
  onDragEnd: (id: string, position: { x: number; y: number }) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onStartConnect: (id: string) => void;
}

export function DraggableBlock({
  block,
  isSelected,
  isConnecting,
  onDragEnd,
  onRemove,
  onSelect,
  onStartConnect,
}: DraggableBlockProps) {
  const bind = useDrag(({ offset: [x, y], last }) => {
    if (last) {
      onDragEnd(block.id, { x, y });
    }
  }, {
    from: () => [block.position.x, block.position.y],
  }) as any;

  const colorClasses = {
    trigger: 'border-green-400/70 bg-green-950/30 shadow-green-400/20',
    condition: 'border-yellow-400/70 bg-yellow-950/30 shadow-yellow-400/20',
    action: 'border-blue-400/70 bg-blue-950/30 shadow-blue-400/20',
  };

  const textColorClasses = {
    trigger: 'text-green-400',
    condition: 'text-yellow-400',
    action: 'text-blue-400',
  };

  return (
    <motion.div
      {...bind()}
      onClick={() => onSelect(block.id)}
      className={cn(
        "absolute cursor-move p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm min-w-[180px] touch-none",
        colorClasses[block.type],
        isSelected && "ring-2 ring-white ring-offset-2 ring-offset-background",
        isConnecting && "cursor-crosshair"
      )}
      style={{
        x: block.position.x,
        y: block.position.y,
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-xs font-semibold uppercase tracking-wider", textColorClasses[block.type])}>
          {block.type}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnect(block.id);
            }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Create connection"
          >
            <Link2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(block.id);
            }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Remove block"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="text-sm font-medium">{block.label}</div>
      {Object.keys(block.config).length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          {Object.entries(block.config).map(([key, value]) => (
            <div key={key}>
              <span className="opacity-70">{key}:</span> {String(value) || '(empty)'}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
