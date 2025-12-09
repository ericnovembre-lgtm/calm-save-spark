import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Target, DollarSign, Zap, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCoPilot } from '@/contexts/CoPilotContext';
import { useIsMobile } from '@/hooks/use-mobile';
import type { PulseState } from '@/types/copilot';

const pulseColors: Record<PulseState, { ring: string; bg: string; dot: string }> = {
  idle: {
    ring: 'hsl(var(--primary) / 0.3)',
    bg: 'hsl(var(--primary))',
    dot: 'bg-primary',
  },
  help: {
    ring: 'hsl(38 92% 50% / 0.4)',
    bg: 'hsl(38 92% 50%)',
    dot: 'bg-amber-500',
  },
  anomaly: {
    ring: 'hsl(38 92% 50% / 0.4)',
    bg: 'hsl(38 92% 50%)',
    dot: 'bg-amber-500',
  },
  opportunity: {
    ring: 'hsl(142 71% 45% / 0.4)',
    bg: 'hsl(142 71% 45%)',
    dot: 'bg-emerald-500',
  },
  urgent: {
    ring: 'hsl(0 84% 60% / 0.4)',
    bg: 'hsl(0 84% 60%)',
    dot: 'bg-rose-500',
  },
};

const quickActions = [
  { icon: Target, label: 'New Goal', path: '/goals' },
  { icon: DollarSign, label: 'Add Transaction', path: '/transactions' },
  { icon: Zap, label: 'Quick Transfer', path: '/accounts' },
];

export function UnifiedCoPilotFAB() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isOpen, pulseNotification, clearPulse, openCoPilot, toggleCoPilot } = useCoPilot();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hide FAB on dashboard page
  if (location.pathname === '/dashboard') {
    return null;
  }

  const state = pulseNotification?.state ?? 'idle';
  const colors = pulseColors[state];
  const hasNotification = !!pulseNotification;

  const handleMainClick = () => {
    if (isOpen) {
      toggleCoPilot();
      return;
    }
    
    if (hasNotification && !isExpanded) {
      // First click on notification shows tooltip, second opens panel
      clearPulse();
      openCoPilot();
      return;
    }
    
    setIsExpanded(!isExpanded);
  };

  const handleAction = (path: string) => {
    navigate(path);
    setIsExpanded(false);
  };

  const handleAskCoPilot = () => {
    setIsExpanded(false);
    openCoPilot();
  };

  return (
    <div
      className={`fixed z-50 ${isMobile ? 'bottom-20 right-4' : 'bottom-6 right-6'}`}
      data-copilot-id="copilot-orb"
    >
      {/* Quick Actions Menu */}
      <AnimatePresence>
        {isExpanded && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-3 space-y-2"
          >
            {/* Ask CoPilot Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0 }}
              className="flex items-center gap-2 justify-end"
            >
              <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1.5 rounded-full shadow-lg text-sm font-medium whitespace-nowrap">
                Ask CoPilot
              </span>
              <motion.button
                onClick={handleAskCoPilot}
                className="h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground flex items-center justify-center"
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              >
                <MessageCircle className="h-5 w-5" />
              </motion.button>
            </motion.div>

            {/* Quick Actions */}
            {quickActions.map((action, index) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: (index + 1) * 0.05 }}
                className="flex items-center gap-2 justify-end"
              >
                <span className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg text-sm font-medium whitespace-nowrap border border-border/50">
                  {action.label}
                </span>
                <motion.button
                  onClick={() => handleAction(action.path)}
                  className="h-12 w-12 rounded-full shadow-lg bg-secondary text-secondary-foreground flex items-center justify-center border border-border/50"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                >
                  <action.icon className="h-5 w-5" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse Rings for Notifications */}
      <AnimatePresence>
        {hasNotification && !isOpen && !prefersReducedMotion && (
          <>
            <motion.div
              className="absolute inset-0 w-14 h-14 rounded-full"
              style={{ backgroundColor: colors.ring }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: [1, 1.8, 1.8], opacity: [0.6, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 w-14 h-14 rounded-full"
              style={{ backgroundColor: colors.ring }}
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: [1, 1.5, 1.5], opacity: [0.4, 0.2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={handleMainClick}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center 
          focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          group overflow-hidden
          ${hasNotification && !isOpen
            ? ''
            : 'bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.1)]'
          }`}
        style={hasNotification && !isOpen ? { backgroundColor: colors.bg } : undefined}
        whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        aria-label={
          isOpen
            ? 'Close Co-Pilot'
            : isExpanded
            ? 'Close quick actions'
            : hasNotification
            ? pulseNotification?.message
            : 'Open quick actions'
        }
      >
        {/* Glassmorphism effects when not in notification state */}
        {!hasNotification && !isOpen && (
          <>
            {/* Inner glow */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-radial from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Shimmer */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                animate={prefersReducedMotion ? {} : { translateX: ['100%', '-100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              />
            </div>
          </>
        )}

        {/* Icon */}
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
          ) : isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <X className="h-6 w-6 text-foreground" />
            </motion.div>
          ) : hasNotification ? (
            <motion.div
              key="notification"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative z-10"
            >
              <svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2" />
                <path d="M12 21v2" />
                <path d="M4.22 4.22l1.42 1.42" />
                <path d="M18.36 18.36l1.42 1.42" />
                <path d="M1 12h2" />
                <path d="M21 12h2" />
                <path d="M4.22 19.78l1.42-1.42" />
                <path d="M18.36 5.64l1.42-1.42" />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="default"
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

        {/* Notification dot indicator */}
        {hasNotification && !isOpen && !isExpanded && (
          <span className={`absolute top-0 right-0 w-3 h-3 rounded-full ${colors.dot} ring-2 ring-background`} />
        )}
      </motion.button>

      {/* Notification Tooltip */}
      <AnimatePresence>
        {hasNotification && !isOpen && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none"
          >
            <div
              className="px-3 py-2 rounded-lg text-sm font-medium shadow-lg text-white"
              style={{ backgroundColor: colors.bg }}
            >
              {pulseNotification?.message}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2"
                style={{ backgroundColor: colors.bg }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
