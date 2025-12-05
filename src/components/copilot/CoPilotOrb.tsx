import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useCoPilot } from '@/contexts/CoPilotContext';
import { ProactivePulse } from './ProactivePulse';

export function CoPilotOrb() {
  const { isOpen, pulseNotification, toggleCoPilot } = useCoPilot();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Show pulse orb when there's a notification, otherwise show simple FAB
  if (pulseNotification && !isOpen) {
    return (
      <div className="fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6">
        <ProactivePulse size={56} />
      </div>
    );
  }
  
  return (
    <motion.button
      onClick={toggleCoPilot}
      className="fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      aria-label={isOpen ? 'Close Co-Pilot' : 'Open Co-Pilot'}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className="h-6 w-6" />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MessageCircle className="h-6 w-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
