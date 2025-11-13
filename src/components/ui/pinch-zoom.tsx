import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PinchZoomProps {
  children: ReactNode;
  minScale?: number;
  maxScale?: number;
  className?: string;
}

/**
 * PinchZoom - Pinch-to-zoom container for charts and images
 * Supports both pinch gestures and mouse wheel zoom
 */
export function PinchZoom({
  children,
  minScale = 0.5,
  maxScale = 3,
  className = '',
}: PinchZoomProps) {
  const prefersReducedMotion = useReducedMotion();
  const [scale, setScale] = useState(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Handle wheel zoom (desktop)
  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(minScale, Math.min(maxScale, scale + delta));
      setScale(newScale);
    }
  };

  useEffect(() => {
    const element = document.getElementById('pinch-zoom-container');
    if (!element) return;

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [scale]);

  // Reset on double tap/click
  const handleDoubleClick = () => {
    setScale(1);
    x.set(0);
    y.set(0);
  };

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      id="pinch-zoom-container"
      className={cn('relative overflow-hidden touch-none', className)}
      onDoubleClick={handleDoubleClick}
    >
      <motion.div
        drag={scale > 1}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        style={{ x, y, scale }}
        animate={{ scale }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="origin-center"
      >
        {children}
      </motion.div>

      {/* Zoom indicator */}
      {scale !== 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium shadow-lg"
        >
          {Math.round(scale * 100)}%
        </motion.div>
      )}

      {/* Reset hint */}
      {scale !== 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="absolute top-4 right-4 text-xs text-muted-foreground"
        >
          Double-tap to reset
        </motion.div>
      )}
    </div>
  );
}
