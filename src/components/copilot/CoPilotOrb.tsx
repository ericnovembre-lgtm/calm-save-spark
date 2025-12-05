import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { useCoPilot } from '@/contexts/CoPilotContext';
import { ProactivePulse } from './ProactivePulse';

export function CoPilotOrb() {
  const { isOpen, pulseNotification, toggleCoPilot } = useCoPilot();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Show pulse orb when there's a notification, otherwise show glassmorphism FAB
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
      className="fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6 w-14 h-14 rounded-full 
        bg-white/10 dark:bg-black/20 
        backdrop-blur-xl 
        border border-white/20 dark:border-white/10
        shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.1)]
        flex items-center justify-center 
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        group overflow-hidden"
      whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      aria-label={isOpen ? 'Close Co-Pilot' : 'Open Co-Pilot'}
      data-copilot-id="copilot-orb"
    >
      {/* Inner glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-radial from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          animate={prefersReducedMotion ? {} : { translateX: ['100%', '-100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        />
      </div>
      
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            <X className="h-6 w-6 text-foreground" />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            <Sparkles className="h-6 w-6 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
