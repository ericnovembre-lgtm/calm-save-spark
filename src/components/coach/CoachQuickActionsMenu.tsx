import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, PieChart, Radar, Receipt, Shield } from 'lucide-react';
import { audioManager } from '@/lib/audio-manager';
import { haptics } from '@/lib/haptics';

interface CoachQuickActionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onScenario: (scenario: string) => void;
  onChatPrompt: (prompt: string) => void;
  onScrollToRadar: () => void;
}

export const CoachQuickActionsMenu = ({
  isOpen,
  onClose,
  onScenario,
  onChatPrompt,
  onScrollToRadar,
}: CoachQuickActionsMenuProps) => {
  const actions = [
    {
      icon: Briefcase,
      label: 'Job Loss',
      color: 'text-command-rose',
      bgColor: 'bg-command-rose/10',
      borderColor: 'border-command-rose/30',
      onClick: () => {
        onScenario("What if I lose my job?");
        onClose();
      },
      angle: 270, // Top
    },
    {
      icon: PieChart,
      label: 'Spending',
      color: 'text-command-cyan',
      bgColor: 'bg-command-cyan/10',
      borderColor: 'border-command-cyan/30',
      onClick: () => {
        onChatPrompt("Analyze my spending patterns this month");
        onClose();
      },
      angle: 342, // Top-right
    },
    {
      icon: Radar,
      label: 'Savings',
      color: 'text-command-emerald',
      bgColor: 'bg-command-emerald/10',
      borderColor: 'border-command-emerald/30',
      onClick: () => {
        onScrollToRadar();
        onClose();
      },
      angle: 54, // Right-bottom
    },
    {
      icon: Receipt,
      label: 'Bills',
      color: 'text-command-violet',
      bgColor: 'bg-command-violet/10',
      borderColor: 'border-command-violet/30',
      onClick: () => {
        onChatPrompt("What bills do I have coming up?");
        onClose();
      },
      angle: 126, // Bottom-left
    },
    {
      icon: Shield,
      label: 'Emergency',
      color: 'text-command-amber',
      bgColor: 'bg-command-amber/10',
      borderColor: 'border-command-amber/30',
      onClick: () => {
        onChatPrompt("How is my emergency fund looking?");
        onClose();
      },
      angle: 198, // Left
    },
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    haptics.vibrate('light');
    audioManager.playClick();
    action.onClick();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Center reference point */}
          <div className="fixed bottom-6 right-6 z-50">
            {/* Action Buttons */}
            {actions.map((action, index) => {
              const Icon = action.icon;
              const radius = 120;
              const angleRad = (action.angle * Math.PI) / 180;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;

              return (
                <motion.button
                  key={action.label}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ scale: 1, x, y }}
                  exit={{ scale: 0, x: 0, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: index * 0.05,
                  }}
                  onClick={() => handleActionClick(action)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 
                    w-16 h-16 rounded-full border-2 ${action.bgColor} ${action.borderColor}
                    flex flex-col items-center justify-center gap-1
                    hover:scale-110 transition-transform shadow-lg backdrop-blur-sm`}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={`w-5 h-5 ${action.color}`} />
                  <span className={`text-[10px] font-mono font-semibold ${action.color}`}>
                    {action.label}
                  </span>
                </motion.button>
              );
            })}

            {/* Center Close Button */}
            <motion.button
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={onClose}
              className="absolute -translate-x-1/2 -translate-y-1/2 
                w-12 h-12 rounded-full bg-command-surface border-2 border-white/20
                flex items-center justify-center text-white hover:bg-command-surface/80
                transition-colors shadow-xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xl">×</span>
            </motion.button>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
