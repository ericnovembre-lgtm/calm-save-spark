import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, Sparkles, Settings, MessageCircle } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { haptics } from '@/lib/haptics';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}

interface QuickActionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickActionsMenu({ isOpen, onClose }: QuickActionsMenuProps) {
  const prefersReducedMotion = useReducedMotion();

  const actions: QuickAction[] = [
    {
      icon: MessageCircle,
      label: 'Ask Question',
      onClick: () => {
        haptics.buttonPress();
        onClose();
      },
    },
    {
      icon: Sparkles,
      label: 'Quick Tips',
      onClick: () => {
        haptics.buttonPress();
        onClose();
      },
    },
    {
      icon: FileQuestion,
      label: 'FAQ',
      onClick: () => {
        haptics.buttonPress();
        onClose();
      },
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => {
        haptics.buttonPress();
        onClose();
      },
    },
  ];

  const radius = 80;
  const angleStep = 360 / actions.length;

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
            className="fixed inset-0 z-40"
          />

          {/* Action Items */}
          <div className="fixed bottom-6 right-6 z-50">
            {actions.map((action, index) => {
              const angle = (angleStep * index - 90) * (Math.PI / 180);
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <motion.button
                  key={action.label}
                  initial={prefersReducedMotion ? false : { scale: 0, x: 0, y: 0 }}
                  animate={{ scale: 1, x, y }}
                  exit={{ scale: 0, x: 0, y: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 20,
                    stiffness: 300,
                    delay: index * 0.05,
                  }}
                  onClick={action.onClick}
                  className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                  aria-label={action.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <action.icon className="w-5 h-5" />
                </motion.button>
              );
            })}
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
