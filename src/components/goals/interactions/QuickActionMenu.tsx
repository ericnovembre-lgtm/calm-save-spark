import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, DollarSign, Target, TrendingUp, Settings } from 'lucide-react';
import { radialMenu } from '@/lib/motion-variants-advanced';
import { audioManager } from '@/lib/audio-manager';
import { haptics } from '@/lib/haptics';

interface QuickActionMenuProps {
  onNewGoal?: () => void;
  onQuickDeposit?: () => void;
  onSetMilestone?: () => void;
  onOptimize?: () => void;
  onSettings?: () => void;
}

/**
 * Radial FAB menu for quick actions
 * Expands into circular menu on click
 */
export const QuickActionMenu = ({
  onNewGoal,
  onQuickDeposit,
  onSetMilestone,
  onOptimize,
  onSettings
}: QuickActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Target, label: 'New Goal', onClick: onNewGoal, angle: 0 },
    { icon: DollarSign, label: 'Deposit', onClick: onQuickDeposit, angle: 72 },
    { icon: TrendingUp, label: 'Milestone', onClick: onSetMilestone, angle: 144 },
    { icon: TrendingUp, label: 'Optimize', onClick: onOptimize, angle: 216 },
    { icon: Settings, label: 'Settings', onClick: onSettings, angle: 288 }
  ];

  const handleMainClick = () => {
    setIsOpen(!isOpen);
    audioManager.playClick();
    haptics.vibrate('light');
  };

  const handleActionClick = (action: typeof actions[0]) => {
    action.onClick?.();
    setIsOpen(false);
    audioManager.playClick();
    haptics.vibrate('medium');
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Action buttons */}
      <AnimatePresence>
        {isOpen && actions.map((action, i) => {
          const radius = 80;
          const angleRad = (action.angle * Math.PI) / 180;
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;

          return (
            <motion.button
              key={i}
              className="
                absolute w-12 h-12 rounded-full
                bg-card border-2 border-primary
                flex items-center justify-center
                shadow-lg hover:shadow-xl
                hover:scale-110 transition-transform
              "
              style={{
                left: '50%',
                top: '50%'
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x, y, opacity: 1, scale: 1 }}
              exit={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300,
                delay: i * 0.03
              }}
              onClick={() => handleActionClick(action)}
            >
              <action.icon className="w-5 h-5 text-primary" />
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        className="
          w-16 h-16 rounded-full
          bg-primary text-primary-foreground
          flex items-center justify-center
          shadow-2xl hover:shadow-primary/50
          transition-shadow duration-300
        "
        onClick={handleMainClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <Plus className="w-8 h-8" />
      </motion.button>
    </div>
  );
};
