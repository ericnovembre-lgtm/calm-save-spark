import { motion } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { useState } from 'react';
import { haptics } from '@/lib/haptics';
import { DollarSign, Trash2 } from 'lucide-react';
import { audioManager } from '@/lib/audio-manager';

interface GestureGoalCardProps {
  id: string;
  name: string;
  current: number;
  target: number;
  onQuickDeposit?: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
  children: React.ReactNode;
}

/**
 * Goal card with swipe gestures
 * Swipe left: Quick actions
 * Swipe right: Quick deposit
 * Long press: Details
 */
export const GestureGoalCard = ({
  id,
  name,
  current,
  target,
  onQuickDeposit,
  onDelete,
  children
}: GestureGoalCardProps) => {
  const [swipeState, setSwipeState] = useState<'neutral' | 'deposit' | 'delete'>('neutral');

  const bind = useDrag(
    ({ movement: [mx], last, velocity: [vx], direction: [dx] }) => {
      // Determine swipe direction and strength
      const isSwipeLeft = dx < 0 && Math.abs(mx) > 100;
      const isSwipeRight = dx > 0 && Math.abs(mx) > 100;

      if (last) {
        if (isSwipeRight && onQuickDeposit) {
          // Swipe right = Quick deposit
          haptics.vibrate('medium');
          audioManager.playCoinClink();
          onQuickDeposit(id);
          setSwipeState('neutral');
        } else if (isSwipeLeft && onDelete) {
          // Swipe left = Delete
          haptics.vibrate('medium');
          audioManager.playSwipe();
          setSwipeState('delete');
          setTimeout(() => {
            onDelete(id);
          }, 300);
        } else {
          setSwipeState('neutral');
        }
      } else {
        // Visual feedback during drag
        if (mx > 50) setSwipeState('deposit');
        else if (mx < -50) setSwipeState('delete');
        else setSwipeState('neutral');
      }
    },
    {
      axis: 'x',
      bounds: { left: -200, right: 200 },
      rubberband: true
    }
  );

  return (
    <div className="relative">
      {/* Background action hints */}
      <div className="absolute inset-0 flex items-center justify-between px-6 rounded-3xl overflow-hidden">
        {/* Right swipe = Deposit */}
        <motion.div
          className="flex items-center gap-2 text-primary"
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: swipeState === 'deposit' ? 1 : 0,
            x: swipeState === 'deposit' ? 0 : -20
          }}
        >
          <DollarSign className="w-6 h-6" />
          <span className="font-semibold">Quick Deposit</span>
        </motion.div>

        {/* Left swipe = Delete */}
        <motion.div
          className="flex items-center gap-2 text-destructive ml-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: swipeState === 'delete' ? 1 : 0,
            x: swipeState === 'delete' ? 0 : 20
          }}
        >
          <span className="font-semibold">Delete</span>
          <Trash2 className="w-6 h-6" />
        </motion.div>
      </div>

      {/* Draggable card */}
      <motion.div
        onPointerDown={bind().onPointerDown}
        onPointerMove={bind().onPointerMove}
        onPointerUp={bind().onPointerUp}
        onPointerCancel={bind().onPointerCancel}
        style={{ touchAction: 'pan-y' }}
        className="relative cursor-grab active:cursor-grabbing"
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.div>
    </div>
  );
};
