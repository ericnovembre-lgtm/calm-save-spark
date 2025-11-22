import { motion, Reorder } from 'framer-motion';
import { WidgetPriority } from '@/hooks/useGenerativeLayoutEngine';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode } from 'react';

interface GenerativeWidgetGridProps {
  priorities: WidgetPriority[];
  widgets: Record<string, ReactNode>;
  onReorder?: (newOrder: WidgetPriority[]) => void;
}

/**
 * Generative Widget Grid
 * Adaptive masonry layout that reshuffles based on priority scores
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

  return (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {priorities.map((priority, index) => {
        const widget = widgets[priority.id];
        if (!widget) return null;

        return (
          <motion.div
            key={priority.id}
            layout
            layoutId={priority.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              layout: { 
                duration: prefersReducedMotion ? 0 : 0.5, 
                type: 'spring', 
                bounce: 0.2 
              },
              opacity: { duration: 0.3 },
              delay: index * 0.05
            }}
            className={getGridClass(priority.size)}
          >
            {/* Priority indicator badge */}
            {priority.score > 80 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (index * 0.05) }}
                className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                </span>
                Needs Attention
              </motion.div>
            )}
            
            {/* Widget wrapper with glassmorphic styling */}
            <div className="h-full">
              {widget}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
