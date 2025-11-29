import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeatureSpotlight } from '@/hooks/useFeatureSpotlight';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { announce } from '@/components/layout/LiveRegion';
import { cn } from '@/lib/utils';

export function FeatureSpotlight() {
  const {
    activeFeature,
    isSpotlightActive,
    pendingCount,
    markFeatureSeen,
    skipAllSpotlights,
  } = useFeatureSpotlight();
  
  const prefersReducedMotion = useReducedMotion();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Find and track the target element
  useEffect(() => {
    if (!activeFeature?.tourStep) {
      setTargetRect(null);
      return;
    }

    const findElement = () => {
      const element = document.querySelector(`[data-tour="${activeFeature.tourStep}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Announce to screen readers
        announce(`New feature: ${activeFeature.title}`, 'polite');
      }
    };

    // Initial find
    findElement();
    
    // Re-find on scroll/resize
    const handleUpdate = () => findElement();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);
    
    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [activeFeature]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSpotlightActive) return;
      
      if (e.key === 'Escape') {
        skipAllSpotlights();
      } else if (e.key === 'Enter' || e.key === ' ') {
        markFeatureSeen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpotlightActive, markFeatureSeen, skipAllSpotlights]);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!isSpotlightActive || !activeFeature) return;
    
    const timer = setTimeout(() => {
      markFeatureSeen();
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [activeFeature, isSpotlightActive, markFeatureSeen]);

  if (!isSpotlightActive || !activeFeature || !targetRect) {
    return null;
  }

  // Calculate spotlight position with padding
  const padding = 16;
  const spotlightX = targetRect.left - padding;
  const spotlightY = targetRect.top - padding;
  const spotlightWidth = targetRect.width + padding * 2;
  const spotlightHeight = targetRect.height + padding * 2;

  // Calculate tooltip position
  const tooltipTop = spotlightY + spotlightHeight + 16;
  const tooltipLeft = Math.max(16, Math.min(
    spotlightX,
    window.innerWidth - 340
  ));

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] pointer-events-none"
        role="dialog"
        aria-label={`New feature: ${activeFeature.title}`}
      >
        {/* Backdrop with cutout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          className="absolute inset-0 pointer-events-auto"
          onClick={markFeatureSeen}
          style={{
            background: `radial-gradient(
              ellipse ${spotlightWidth + 100}px ${spotlightHeight + 100}px 
              at ${spotlightX + spotlightWidth / 2}px ${spotlightY + spotlightHeight / 2}px,
              transparent 0%,
              transparent 60%,
              hsl(var(--background) / 0.85) 100%
            )`,
          }}
        />

        {/* Pulsing ring around target */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            boxShadow: prefersReducedMotion 
              ? '0 0 0 3px hsl(var(--primary) / 0.5)'
              : [
                  '0 0 0 3px hsl(var(--primary) / 0.3)',
                  '0 0 0 6px hsl(var(--primary) / 0.5)',
                  '0 0 0 3px hsl(var(--primary) / 0.3)',
                ]
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.3,
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          }}
          className="absolute rounded-xl"
          style={{
            top: spotlightY,
            left: spotlightX,
            width: spotlightWidth,
            height: spotlightHeight,
          }}
        />

        {/* Tooltip */}
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 0.3,
            delay: prefersReducedMotion ? 0 : 0.15 
          }}
          className={cn(
            "absolute pointer-events-auto",
            "w-80 p-4 rounded-xl",
            "bg-background/95 backdrop-blur-xl",
            "border border-border/50 shadow-2xl"
          )}
          style={{
            top: tooltipTop,
            left: tooltipLeft,
          }}
        >
          {/* NEW badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
              <Sparkles className="w-3 h-3" />
              NEW
            </span>
            {pendingCount > 1 && (
              <span className="text-xs text-muted-foreground">
                {pendingCount} new features
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-6 w-6"
              onClick={skipAllSpotlights}
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Skip all</span>
            </Button>
          </div>

          {/* Content */}
          <h3 className="font-semibold text-foreground mb-1">
            {activeFeature.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {activeFeature.description}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={markFeatureSeen}
            >
              Got it
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            {pendingCount > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={skipAllSpotlights}
                className="text-xs"
              >
                Skip all
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
