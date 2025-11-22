import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface DragToSaveZoneProps {
  goalId: string;
  goalName: string;
  isHovered: boolean;
  onRegister: (id: string, element: HTMLElement) => void;
  onUnregister: (id: string) => void;
  amount?: number;
}

/**
 * Drop zone for drag-to-save interaction
 * Highlights when coin is dragged over it
 */
export const DragToSaveZone = ({
  goalId,
  goalName,
  isHovered,
  onRegister,
  onUnregister,
  amount = 100
}: DragToSaveZoneProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (ref.current) {
      onRegister(goalId, ref.current);
    }
    return () => onUnregister(goalId);
  }, [goalId, onRegister, onUnregister]);

  return (
    <motion.div
      ref={ref}
      className={cn(
        'absolute inset-0 rounded-3xl pointer-events-none transition-all duration-300',
        'border-2 border-dashed',
        isHovered
          ? 'border-primary bg-primary/10 opacity-100'
          : 'border-transparent opacity-0'
      )}
      animate={isHovered && !prefersReducedMotion ? {
        scale: [1, 1.02, 1],
        boxShadow: [
          '0 0 0 0 hsla(var(--primary) / 0)',
          '0 0 20px 10px hsla(var(--primary) / 0.3)',
          '0 0 0 0 hsla(var(--primary) / 0)'
        ]
      } : undefined}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {isHovered && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="bg-primary/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-primary/40">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-primary">Drop to add</p>
                <p className="text-xs text-primary/80">${amount} to {goalName}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
