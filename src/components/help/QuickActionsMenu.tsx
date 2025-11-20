import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, Sparkles, Settings, MessageCircle } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

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
      onClick: onClose,
    },
    {
      icon: Sparkles,
      label: 'Quick Tips',
      onClick: onClose,
    },
    {
      icon: FileQuestion,
      label: 'FAQ',
      onClick: onClose,
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: onClose,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />

          {/* Action Items */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={prefersReducedMotion ? false : { scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{
                  duration: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                  delay: index * 0.05,
                }}
                onClick={action.onClick}
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform"
                aria-label={action.label}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <action.icon className="w-5 h-5" />
              </motion.button>
            ))}
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
