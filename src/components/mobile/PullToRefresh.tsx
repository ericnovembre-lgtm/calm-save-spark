import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

/**
 * PullToRefresh - Mobile pull-to-refresh gesture handler
 * Provides haptic feedback and animated loading indicator
 */
export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, MAX_PULL], [0, 360]);
  const scale = useTransform(y, [0, PULL_THRESHOLD, MAX_PULL], [0.5, 1, 1.2]);
  const opacity = useTransform(y, [0, PULL_THRESHOLD], [0, 1]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = () => {
      // Only allow pull-to-refresh if at top of page
      setCanPull(container.scrollTop === 0);
    };

    container.addEventListener('touchstart', handleTouchStart);
    return () => container.removeEventListener('touchstart', handleTouchStart);
  }, []);

  const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!canPull || isRefreshing) return;

    if (info.offset.y > PULL_THRESHOLD) {
      setIsRefreshing(true);
      triggerHaptic('success');
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        y.set(0);
      }
    } else {
      y.set(0);
    }
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!canPull || isRefreshing) return;

    if (info.offset.y > PULL_THRESHOLD && !isRefreshing) {
      triggerHaptic('light');
    }
  };

  return (
    <div ref={containerRef} className="relative overflow-y-auto h-full">
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center items-center h-20 -mt-20 z-50"
        style={{ y }}
      >
        <motion.div
          className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg"
          style={{ 
            rotate: prefersReducedMotion ? 0 : rotate, 
            scale: prefersReducedMotion ? 1 : scale,
            opacity 
          }}
        >
          <RefreshCw 
            className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} 
          />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag={canPull && !isRefreshing ? "y" : false}
        dragConstraints={{ top: 0, bottom: MAX_PULL }}
        dragElastic={0.4}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        {children}
      </motion.div>
    </div>
  );
}
