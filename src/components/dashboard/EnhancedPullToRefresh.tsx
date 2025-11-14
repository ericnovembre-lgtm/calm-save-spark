import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { SaveplusAnimIcon } from "@/components/icons";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface EnhancedPullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function EnhancedPullToRefresh({ onRefresh, children }: EnhancedPullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReleased, setIsReleased] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, 100], [0, 1]);
  const iconRotate = useTransform(y, [0, 100], [0, 360]);
  
  const threshold = 80;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isDragging = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > 0) {
        e.preventDefault();
        // Rubber band effect
        const resistance = 0.5;
        y.set(Math.min(diff * resistance, 120));
      }
    };

    const handleTouchEnd = async () => {
      if (!isDragging) return;
      isDragging = false;

      if (y.get() >= threshold && !isRefreshing) {
        setIsReleased(true);
        setIsRefreshing(true);
        
        // Snap to refresh position
        animate(y, 60, {
          type: "spring",
          stiffness: 300,
          damping: 30
        });

        try {
          await onRefresh();
        } finally {
          // Success animation
          setTimeout(() => {
            animate(y, 0, {
              type: "spring",
              stiffness: 300,
              damping: 30
            });
            setIsRefreshing(false);
            setIsReleased(false);
          }, 500);
        }
      } else {
        animate(y, 0, {
          type: "spring",
          stiffness: 300,
          damping: 30
        });
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isRefreshing, onRefresh, y, threshold]);

  return (
    <div ref={containerRef} className="relative overflow-y-auto">
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-50"
        style={{ 
          height: y,
          opacity: pullProgress
        }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          style={{
            scale: useTransform(y, [0, threshold], [0.8, 1])
          }}
        >
          {isRefreshing ? (
            <>
              <motion.div
                animate={!prefersReducedMotion ? { rotate: 360 } : undefined}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <SaveplusAnimIcon name="loader-circle" size={32} className="text-primary" decorative />
              </motion.div>
              <span className="text-sm font-medium text-primary">Refreshing...</span>
            </>
          ) : (
            <>
              <motion.div style={{ rotate: iconRotate }}>
                <SaveplusAnimIcon name="refresh-cw" size={32} className="text-primary" decorative />
              </motion.div>
              <span className="text-sm font-medium text-muted-foreground">
                {y.get() >= threshold ? "Release to refresh" : "Pull to refresh"}
              </span>
            </>
          )}

          {/* Progress indicator */}
          <motion.div
            className="w-16 h-1 bg-muted rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              style={{
                width: useTransform(y, [0, threshold], ["0%", "100%"])
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
