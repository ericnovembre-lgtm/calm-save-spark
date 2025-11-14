import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ArrowUpDown, 
  Target, 
  TrendingUp,
  MessageCircle,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AIChat } from '@/components/coach/AIChat';
import { Button } from '@/components/ui/button';

interface FABAction {
  id: string;
  label: string;
  icon: typeof Plus;
  action: () => void;
  color: string;
}

/**
 * Unified Floating Action Button
 * Combines transfer, goals, insights, and AI chat actions
 * Positioned to avoid mobile navigation overlap
 */
export function UnifiedFAB() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const haptics = useHapticFeedback();

  const actions: FABAction[] = [
    {
      id: 'transfer',
      label: 'Transfer Money',
      icon: ArrowUpDown,
      action: () => {
        haptics.triggerHaptic('light');
        setIsExpanded(false);
        // Scroll to manual transfer card
        document.getElementById('manual-transfer')?.scrollIntoView({ behavior: 'smooth' });
      },
      color: 'bg-primary text-primary-foreground',
    },
    {
      id: 'goal',
      label: 'Add Goal',
      icon: Target,
      action: () => {
        haptics.triggerHaptic('light');
        setIsExpanded(false);
        navigate('/goals');
      },
      color: 'bg-secondary text-secondary-foreground',
    },
    {
      id: 'insights',
      label: 'View Insights',
      icon: TrendingUp,
      action: () => {
        haptics.triggerHaptic('light');
        setIsExpanded(false);
        navigate('/analytics');
      },
      color: 'bg-accent text-accent-foreground',
    },
    {
      id: 'chat',
      label: 'AI Coach',
      icon: MessageCircle,
      action: () => {
        haptics.triggerHaptic('light');
        setIsExpanded(false);
        setIsChatOpen(true);
      },
      color: 'bg-primary text-primary-foreground',
    },
  ];

  const toggleMenu = () => {
    haptics.triggerHaptic('light');
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50">
        {/* Action Items */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="absolute bottom-20 right-0 space-y-3"
            >
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={action.action}
                    className={cn(
                      'flex items-center gap-3 rounded-full shadow-lg',
                      'px-4 py-3 min-h-[44px]',
                      'transition-all duration-200',
                      'hover:scale-105 active:scale-95',
                      'focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-ring focus-visible:ring-offset-2',
                      action.color
                    )}
                    whileHover={prefersReducedMotion ? {} : { x: -5 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium whitespace-nowrap">
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          onClick={toggleMenu}
          className={cn(
            'w-14 h-14 rounded-full shadow-lg',
            'bg-primary text-primary-foreground',
            'flex items-center justify-center',
            'transition-shadow duration-200',
            'hover:shadow-xl',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          animate={prefersReducedMotion ? {} : { 
            rotate: isExpanded ? 45 : 0 
          }}
          transition={{ duration: 0.2 }}
          aria-label={isExpanded ? 'Close menu' : 'Open quick actions'}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>

      {/* AI Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-3xl h-[85vh] p-0 gap-0">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">AI Financial Coach</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="h-[calc(85vh-5rem)] overflow-hidden">
            <AIChat />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}