import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface DraggableCoinProps {
  amount: number;
  dragHandlers: any;
  isDragging: boolean;
}

export const DraggableCoin = ({ amount, dragHandlers, isDragging }: DraggableCoinProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      {...dragHandlers}
      className="absolute top-4 right-4 cursor-grab active:cursor-grabbing"
      style={{ zIndex: isDragging ? 1000 : 1 }}
      whileHover={!prefersReducedMotion ? { scale: 1.1, rotate: 15 } : undefined}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="relative p-3 rounded-full bg-primary/20 border-2 border-primary/40 backdrop-blur-sm"
        animate={isDragging && !prefersReducedMotion ? {
          boxShadow: [
            '0 0 20px hsla(var(--primary) / 0.4)',
            '0 0 40px hsla(var(--primary) / 0.6)',
            '0 0 20px hsla(var(--primary) / 0.4)'
          ]
        } : undefined}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Coins className="w-6 h-6 text-primary" />
        <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
          ${amount}
        </div>
      </motion.div>
    </motion.div>
  );
};
