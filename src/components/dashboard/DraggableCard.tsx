import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
  isDragging?: boolean;
  className?: string;
}

/**
 * DraggableCard - Wrapper for dashboard cards with drag-to-reorder capability
 */
export function DraggableCard({ id, children, isDragging, className = '' }: DraggableCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      layout={!prefersReducedMotion}
      layoutId={id}
      className={`relative group ${className}`}
      animate={isDragging ? { scale: 1.05, zIndex: 50 } : { scale: 1, zIndex: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
    >
      {/* Drag handle - visible on hover */}
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="cursor-grab active:cursor-grabbing p-2 rounded-lg bg-muted/50 hover:bg-muted">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {children}
    </motion.div>
  );
}
