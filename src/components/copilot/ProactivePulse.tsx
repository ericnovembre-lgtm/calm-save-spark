import { motion, AnimatePresence } from 'framer-motion';
import { useCoPilot } from '@/contexts/CoPilotContext';
import type { PulseState } from '@/types/copilot';

const pulseColors: Record<PulseState, { ring: string; bg: string; text: string }> = {
  idle: {
    ring: 'hsl(var(--primary) / 0.3)',
    bg: 'hsl(var(--primary))',
    text: 'hsl(var(--primary-foreground))',
  },
  help: {
    ring: 'hsl(200 88% 40% / 0.4)',
    bg: 'hsl(200 88% 40%)',
    text: 'hsl(0 0% 100%)',
  },
  anomaly: {
    ring: 'hsl(38 92% 50% / 0.4)',
    bg: 'hsl(38 92% 50%)',
    text: 'hsl(0 0% 0%)',
  },
  opportunity: {
    ring: 'hsl(142 71% 45% / 0.4)',
    bg: 'hsl(142 71% 45%)',
    text: 'hsl(0 0% 100%)',
  },
  urgent: {
    ring: 'hsl(0 84% 60% / 0.4)',
    bg: 'hsl(0 84% 60%)',
    text: 'hsl(0 0% 100%)',
  },
};

interface ProactivePulseProps {
  size?: number;
  className?: string;
}

export function ProactivePulse({ size = 56, className = '' }: ProactivePulseProps) {
  const { pulseNotification, clearPulse, openCoPilot } = useCoPilot();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const state = pulseNotification?.state ?? 'idle';
  const colors = pulseColors[state];
  
  const handleClick = () => {
    if (pulseNotification) {
      clearPulse();
    }
    openCoPilot();
  };
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Pulse rings - only show when there's a notification */}
      <AnimatePresence>
        {pulseNotification && !prefersReducedMotion && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: colors.ring }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ 
                scale: [1, 1.8, 1.8],
                opacity: [0.6, 0.3, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: colors.ring }}
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ 
                scale: [1, 1.5, 1.5],
                opacity: [0.4, 0.2, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.3,
              }}
            />
          </>
        )}
      </AnimatePresence>
      
      {/* Main orb button */}
      <motion.button
        onClick={handleClick}
        className="absolute inset-0 rounded-full flex items-center justify-center shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={{ backgroundColor: colors.bg }}
        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        aria-label={pulseNotification?.message ?? 'Open Co-Pilot'}
      >
        {/* Inner glow */}
        <div 
          className="absolute inset-1 rounded-full opacity-30"
          style={{ 
            background: `radial-gradient(circle at 30% 30%, white 0%, transparent 60%)` 
          }}
        />
        
        {/* Icon */}
        <svg 
          width={size * 0.4} 
          height={size * 0.4} 
          viewBox="0 0 24 24" 
          fill="none"
          stroke={colors.text}
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
      </motion.button>
      
      {/* Tooltip for notification message */}
      <AnimatePresence>
        {pulseNotification && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
          >
            <div 
              className="px-3 py-2 rounded-lg text-sm font-medium shadow-lg"
              style={{ 
                backgroundColor: colors.bg,
                color: colors.text,
              }}
            >
              {pulseNotification.message}
              {/* Arrow */}
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
