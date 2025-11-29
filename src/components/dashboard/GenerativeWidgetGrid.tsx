import { motion, Reorder } from 'framer-motion';
import { WidgetPriority } from '@/hooks/useGenerativeLayoutEngine';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';

interface GenerativeWidgetGridProps {
  priorities: WidgetPriority[];
  widgets: Record<string, ReactNode>;
  onReorder?: (newOrder: WidgetPriority[]) => void;
}

/**
 * Generative Widget Grid
 * Adaptive masonry layout with priority-based sizing and urgency effects
 */
export function GenerativeWidgetGrid({ 
  priorities, 
  widgets, 
  onReorder 
}: GenerativeWidgetGridProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const getGridClass = (size: 'hero' | 'large' | 'normal'): string => {
    switch (size) {
      case 'hero':
        return 'col-span-full'; // Full width
      case 'large':
        return 'col-span-full md:col-span-2'; // 2 columns on desktop
      case 'normal':
      default:
        return 'col-span-full md:col-span-1'; // 1 column on desktop
    }
  };

  const getUrgencyBadge = (priority: WidgetPriority) => {
    if (priority.urgencyLevel === 'critical') {
      return (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/20 border border-warning/30 text-xs font-medium text-warning"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-warning" />
          </span>
          Urgent
        </motion.div>
      );
    }

    if (priority.score > 85 && priority.urgencyLevel !== 'low') {
      return (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
          </span>
          Needs Attention
        </motion.div>
      );
    }

    if (priority.size === 'hero') {
      return (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-xs font-medium text-success"
        >
          <TrendingUp className="w-3 h-3" />
          Highlighted
        </motion.div>
      );
    }

    return null;
  };

  return (
    <Reorder.Group
      axis="y"
      values={priorities}
      onReorder={(newOrder) => onReorder?.(newOrder)}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      as="div"
    >
      {priorities.map((priority, index) => {
        const widget = widgets[priority.id];
        if (!widget) return null;

        const isPulsing = priority.isPulsing && !prefersReducedMotion;

        return (
          <Reorder.Item
            key={priority.id}
            value={priority}
            layoutId={priority.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              // Pulse effect for urgent items
              ...(isPulsing ? {
                boxShadow: [
                  '0 0 0 0 hsla(var(--warning), 0.3)',
                  '0 0 20px 5px hsla(var(--warning), 0.2)',
                  '0 0 0 0 hsla(var(--warning), 0.3)',
                ],
              } : {})
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              layout: { 
                duration: prefersReducedMotion ? 0 : 0.5, 
                type: 'spring', 
                bounce: 0.2 
              },
              opacity: { duration: 0.3 },
              delay: index * 0.05,
              ...(isPulsing ? {
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              } : {})
            }}
            className={cn(
              getGridClass(priority.size),
              "cursor-grab active:cursor-grabbing",
              "hover:scale-[1.01] transition-transform",
              isPulsing && "ring-2 ring-warning/50 rounded-xl"
            )}
            drag="y"
            as="div"
          >
            {/* Priority indicator badge */}
            {getUrgencyBadge(priority)}
            
            {/* Widget wrapper with glassmorphic styling */}
            <div className={cn(
              "h-full rounded-xl overflow-hidden",
              "backdrop-blur-xl bg-background/5 border border-border/10",
              "shadow-[var(--glass-shadow)]",
              priority.size === 'hero' && "bg-gradient-to-br from-background/10 to-background/5"
            )}>
              {widget}
            </div>
          </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
}
