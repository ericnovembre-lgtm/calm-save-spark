import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { registerSpotlight, unregisterSpotlight } from '@/hooks/useCoPilotActions';

interface SpotlightState {
  elementId: string;
  rect: DOMRect | null;
}

export function CoPilotSpotlight() {
  const [spotlight, setSpotlight] = useState<SpotlightState | null>(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Handle spotlight trigger
  const handleSpotlight = useCallback((elementId: string) => {
    // Find element by data-copilot-id
    const element = document.querySelector(`[data-copilot-id="${elementId}"]`);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setSpotlight({ elementId, rect });
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setSpotlight(prev => prev?.elementId === elementId ? null : prev);
      }, 5000);
    } else {
      console.warn(`Element with data-copilot-id="${elementId}" not found`);
    }
  }, []);
  
  // Register spotlight callback
  useEffect(() => {
    registerSpotlight(handleSpotlight);
    return () => unregisterSpotlight();
  }, [handleSpotlight]);
  
  // Update position on scroll/resize
  useEffect(() => {
    if (!spotlight) return;
    
    const updatePosition = () => {
      const element = document.querySelector(`[data-copilot-id="${spotlight.elementId}"]`);
      if (element) {
        setSpotlight(prev => prev ? { ...prev, rect: element.getBoundingClientRect() } : null);
      }
    };
    
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [spotlight?.elementId]);
  
  // Dismiss on click outside
  const handleDismiss = useCallback(() => {
    setSpotlight(null);
  }, []);
  
  if (!spotlight?.rect) return null;
  
  const padding = 8;
  const { top, left, width, height } = spotlight.rect;
  
  return createPortal(
    <AnimatePresence>
      <motion.div
        key="spotlight-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] pointer-events-auto"
        onClick={handleDismiss}
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          // Create cutout for highlighted element using clip-path
          clipPath: `polygon(
            0% 0%,
            0% 100%,
            ${left - padding}px 100%,
            ${left - padding}px ${top - padding}px,
            ${left + width + padding}px ${top - padding}px,
            ${left + width + padding}px ${top + height + padding}px,
            ${left - padding}px ${top + height + padding}px,
            ${left - padding}px 100%,
            100% 100%,
            100% 0%
          )`,
        }}
      />
      
      {/* Highlight ring around element */}
      <motion.div
        key="spotlight-ring"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          boxShadow: prefersReducedMotion 
            ? '0 0 0 4px hsl(var(--primary))' 
            : [
                '0 0 0 4px hsl(var(--primary))',
                '0 0 0 8px hsl(var(--primary) / 0.3)',
                '0 0 0 4px hsl(var(--primary))',
              ],
        }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={prefersReducedMotion ? {} : { 
          boxShadow: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
        }}
        className="fixed z-[9999] rounded-lg pointer-events-none"
        style={{
          top: top - padding,
          left: left - padding,
          width: width + padding * 2,
          height: height + padding * 2,
        }}
      />
      
      {/* Tooltip */}
      <motion.div
        key="spotlight-tooltip"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed z-[9999] pointer-events-none"
        style={{
          top: top + height + padding + 12,
          left: left + width / 2,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
          Click anywhere to dismiss
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-primary" />
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
