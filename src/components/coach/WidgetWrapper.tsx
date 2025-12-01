import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, ChevronDown, ChevronUp, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WidgetWrapperProps {
  id: string;
  title: string;
  isCollapsed: boolean;
  isPinned: boolean;
  onToggleCollapse: () => void;
  onTogglePin: () => void;
  children: ReactNode;
  className?: string;
}

export function WidgetWrapper({
  id,
  title,
  isCollapsed,
  isPinned,
  onToggleCollapse,
  onTogglePin,
  children,
  className,
}: WidgetWrapperProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative group bg-command-surface/50 border border-white/10 rounded-2xl overflow-hidden",
        isPinned && "ring-2 ring-command-cyan/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div className="cursor-grab active:cursor-grabbing opacity-30 group-hover:opacity-70 transition-opacity">
            <GripVertical className="w-4 h-4 text-white" />
          </div>
          
          <h3 className="text-sm font-semibold font-mono text-white">
            {title}
          </h3>

          {isPinned && (
            <Pin className="w-3 h-3 text-command-cyan" fill="currentColor" />
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Pin Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePin}
            className={cn(
              "h-7 w-7 p-0 hover:bg-white/10",
              isPinned && "text-command-cyan"
            )}
          >
            <Pin className="w-3 h-3" />
          </Button>

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-7 w-7 p-0 hover:bg-white/10"
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-white" />
            ) : (
              <ChevronUp className="w-4 h-4 text-white" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
