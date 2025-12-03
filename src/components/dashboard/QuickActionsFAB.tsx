import { useState } from 'react';
import { Plus, X, ArrowUpRight, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  path?: string;
  onClick?: () => void;
  color: string;
}

/**
 * QuickActionsFAB - Floating action button for quick financial actions
 * Provides quick access to Transfer Money, Add Goal, and View Analytics
 */
export function QuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();

  const quickActions: QuickAction[] = [
    {
      label: 'Transfer Money',
      icon: <ArrowUpRight className="w-5 h-5" />,
      path: '/',
      onClick: () => {
        // Will trigger the manual transfer dialog on dashboard
        navigate('/');
        setIsOpen(false);
      },
      color: 'bg-primary text-primary-foreground',
    },
    {
      label: 'Add Goal',
      icon: <Target className="w-5 h-5" />,
      path: '/goals',
      color: 'bg-accent text-accent-foreground',
    },
    {
      label: 'View Analytics',
      icon: <TrendingUp className="w-5 h-5" />,
      path: '/analytics',
      color: 'bg-secondary text-secondary-foreground',
    },
  ];

  const handleActionClick = (action: QuickAction) => {
    triggerHaptic('light');
    if (action.onClick) {
      action.onClick();
    } else if (action.path) {
      navigate(action.path);
      setIsOpen(false);
    }
  };

  const toggleMenu = () => {
    triggerHaptic('light');
    setIsOpen(!isOpen);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20, scale: prefersReducedMotion ? 1 : 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
        duration: prefersReducedMotion ? 0 : undefined,
      },
    },
  };

  return (
    <>
      {/* Action Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
              aria-hidden="true"
            />

            {/* Action Buttons */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed bottom-24 right-6 flex flex-col gap-3 z-50"
            >
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  variants={itemVariants}
                  onClick={() => handleActionClick(action)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-full shadow-lg
                    ${action.color}
                    hover:shadow-xl transition-shadow
                    group relative
                  `}
                  whileHover={
                    prefersReducedMotion ? undefined : { scale: 1.05 }
                  }
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                  aria-label={action.label}
                >
                  {/* Label - appears on hover */}
                  <span
                    className="absolute right-full mr-3 px-3 py-1.5 rounded-lg
                                 bg-background border border-border text-foreground text-sm
                                 whitespace-nowrap opacity-0 group-hover:opacity-100
                                 transition-opacity pointer-events-none shadow-md"
                  >
                    {action.label}
                  </span>

                  {/* Icon */}
                  <div className="relative z-10">{action.icon}</div>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={toggleMenu}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full z-50 shadow-lg
                   bg-primary text-primary-foreground
                   hover:shadow-xl transition-shadow
                   flex items-center justify-center"
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
        aria-expanded={isOpen}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        animate={
          prefersReducedMotion
            ? undefined
            : { rotate: isOpen ? 135 : 0 }
        }
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </motion.button>
    </>
  );
}
