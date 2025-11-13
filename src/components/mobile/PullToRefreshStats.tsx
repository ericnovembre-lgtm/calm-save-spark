import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface PullToRefreshStatsProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefreshStats = ({
  onRefresh,
  children,
}: PullToRefreshStatsProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const { triggerHaptic } = useHapticFeedback();

  const pullProgress = useTransform(y, [0, 80], [0, 1]);
  const iconRotation = useTransform(y, [0, 80], [0, 360]);

  useEffect(() => {
    // Only enable on mobile
    const isMobile = window.innerWidth < 768;
    setCanPull(isMobile);
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    if (!canPull || isRefreshing) return;

    const container = containerRef.current;
    if (!container) return;

    // Only trigger if at top of scroll
    if (container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!canPull || isRefreshing || startY.current === 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      y.set(Math.min(diff, 100));

      if (diff > 80) {
        triggerHaptic("light");
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!canPull || isRefreshing) return;

    const currentY = y.get();

    if (currentY > 80) {
      setIsRefreshing(true);
      triggerHaptic("success");

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    y.set(0);
    startY.current = 0;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [canPull, isRefreshing]);

  return (
    <div ref={containerRef} className="relative overflow-auto">
      {/* Pull indicator */}
      {canPull && (
        <motion.div
          className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none"
          style={{
            y: y,
            opacity: pullProgress,
            zIndex: 10,
          }}
        >
          <div className="bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-border">
            <motion.div
              style={{ rotate: isRefreshing ? undefined : iconRotation }}
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={
                isRefreshing
                  ? { duration: 1, repeat: Infinity, ease: "linear" }
                  : undefined
              }
            >
              <RefreshCw className="w-6 h-6 text-accent" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div style={{ y: canPull ? y : 0 }}>{children}</motion.div>
    </div>
  );
};
