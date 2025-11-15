import { motion, PanInfo } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { haptics } from '@/lib/haptics';
import { Edit, Trash2, Share2 } from 'lucide-react';

interface GestureCardProps {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  className?: string;
}

export const GestureCard = ({
  children,
  onEdit,
  onDelete,
  onShare,
  className = ''
}: GestureCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [dragX, setDragX] = useState(0);
  const [showActions, setShowActions] = useState<'left' | 'right' | null>(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swiped right - Edit action
      setShowActions('right');
      haptics.vibrate('medium');
      setTimeout(() => {
        onEdit?.();
        setDragX(0);
        setShowActions(null);
      }, 300);
    } else if (info.offset.x < -threshold) {
      // Swiped left - Delete action
      setShowActions('left');
      haptics.vibrate('medium');
      setTimeout(() => {
        onDelete?.();
        setDragX(0);
        setShowActions(null);
      }, 300);
    } else {
      setDragX(0);
      setShowActions(null);
    }
  };

  const handleDrag = (event: any, info: PanInfo) => {
    setDragX(info.offset.x);
    
    // Show action hints
    if (info.offset.x > 50) {
      setShowActions('right');
    } else if (info.offset.x < -50) {
      setShowActions('left');
    } else {
      setShowActions(null);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background action buttons */}
      <div className="absolute inset-0 flex items-center justify-between px-6 rounded-3xl overflow-hidden">
        {/* Right swipe - Edit */}
        <motion.div
          className="flex items-center gap-3 text-primary"
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: showActions === 'right' ? 1 : 0,
            x: showActions === 'right' ? 0 : -20
          }}
        >
          <Edit className="w-6 h-6" />
          <span className="font-semibold">Edit</span>
        </motion.div>

        {/* Left swipe - Delete */}
        <motion.div
          className="flex items-center gap-3 text-destructive ml-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: showActions === 'left' ? 1 : 0,
            x: showActions === 'left' ? 0 : 20
          }}
        >
          <span className="font-semibold">Delete</span>
          <Trash2 className="w-6 h-6" />
        </motion.div>
      </div>

      {/* Draggable card */}
      <motion.div
        drag={prefersReducedMotion ? false : "x"}
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.3}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{ x: dragX }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ touchAction: 'pan-y' }}
        className="relative cursor-grab active:cursor-grabbing"
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      >
        {children}
      </motion.div>
    </div>
  );
};
