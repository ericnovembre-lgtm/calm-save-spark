import { useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { PageIndicator } from './PageIndicator';
import { useIsMobile } from '@/hooks/use-mobile';

interface SwipeNavigationWrapperProps {
  children: ReactNode;
}

export function SwipeNavigationWrapper({ children }: SwipeNavigationWrapperProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    swipeState,
    swipeProgress,
    currentIndex,
    routes,
    canSwipeLeft,
    canSwipeRight,
    navigateToIndex,
    handlers,
  } = useSwipeNavigation();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Attach touch handlers
  useEffect(() => {
    if (!isMobile) return;
    
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handlers.onTouchStart, { passive: true });
    container.addEventListener('touchmove', handlers.onTouchMove, { passive: true });
    container.addEventListener('touchend', handlers.onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handlers.onTouchStart);
      container.removeEventListener('touchmove', handlers.onTouchMove);
      container.removeEventListener('touchend', handlers.onTouchEnd);
    };
  }, [isMobile, handlers]);

  // Calculate transform based on swipe progress
  const getTransform = () => {
    if (!swipeState.isSwiping) return 'translateX(0)';
    
    const direction = swipeState.direction;
    const maxOffset = 50; // Max pixels to show peek
    const offset = swipeProgress * maxOffset;
    
    if (direction === 'left' && canSwipeLeft) {
      return `translateX(-${offset}px)`;
    } else if (direction === 'right' && canSwipeRight) {
      return `translateX(${offset}px)`;
    }
    return 'translateX(0)';
  };

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Edge indicators */}
      <AnimatePresence>
        {swipeState.isSwiping && canSwipeRight && swipeState.direction === 'right' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: swipeProgress * 0.8 }}
            exit={{ opacity: 0 }}
            className="fixed left-0 top-0 bottom-0 w-1 bg-primary z-50"
            style={{ boxShadow: `0 0 ${swipeProgress * 20}px hsl(var(--primary))` }}
          />
        )}
        {swipeState.isSwiping && canSwipeLeft && swipeState.direction === 'left' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: swipeProgress * 0.8 }}
            exit={{ opacity: 0 }}
            className="fixed right-0 top-0 bottom-0 w-1 bg-primary z-50"
            style={{ boxShadow: `0 0 ${swipeProgress * 20}px hsl(var(--primary))` }}
          />
        )}
      </AnimatePresence>

      {/* Page indicator */}
      <PageIndicator
        currentIndex={currentIndex}
        routes={routes}
        onNavigate={navigateToIndex}
      />

      {/* Main content with swipe transform */}
      <motion.div
        style={{
          transform: reducedMotion ? 'none' : getTransform(),
          transition: swipeState.isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </motion.div>

      {/* Peek preview labels */}
      <AnimatePresence>
        {swipeState.isSwiping && swipeProgress > 0.5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-card/90 backdrop-blur-lg rounded-xl px-4 py-2 border border-border/50 shadow-lg">
              <span className="text-sm font-medium text-foreground">
                {swipeState.direction === 'left' && canSwipeLeft && routes[currentIndex + 1]?.label}
                {swipeState.direction === 'right' && canSwipeRight && routes[currentIndex - 1]?.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
