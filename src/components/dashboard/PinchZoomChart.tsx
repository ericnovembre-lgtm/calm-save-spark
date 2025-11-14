import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface PinchZoomChartProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  className?: string;
}

export function PinchZoomChart({ 
  children, 
  minScale = 1, 
  maxScale = 3,
  className = ""
}: PinchZoomChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scaleValue = useMotionValue(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastDistance = 0;
    let lastCenter = { x: 0, y: 0 };

    const getDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getCenter = (touches: TouchList) => {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        lastDistance = getDistance(e.touches);
        lastCenter = getCenter(e.touches);
      } else if (e.touches.length === 1 && scale > 1) {
        setIsPanning(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const distance = getDistance(e.touches);
        const center = getCenter(e.touches);
        
        // Calculate scale
        const scaleChange = distance / lastDistance;
        const newScale = Math.max(minScale, Math.min(maxScale, scale * scaleChange));
        
        // Calculate pan offset
        const deltaX = center.x - lastCenter.x;
        const deltaY = center.y - lastCenter.y;
        
        setScale(newScale);
        scaleValue.set(newScale);
        
        setPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        lastDistance = distance;
        lastCenter = center;
      } else if (e.touches.length === 1 && isPanning) {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastCenter.x;
        const deltaY = touch.clientY - lastCenter.y;
        
        setPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        lastCenter = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        setIsPanning(false);
        
        // Auto-snap to zoom levels
        const snapLevels = [1, 1.5, 2, 3];
        const closest = snapLevels.reduce((prev, curr) => 
          Math.abs(curr - scale) < Math.abs(prev - scale) ? curr : prev
        );
        
        setScale(closest);
        scaleValue.set(closest);
        
        // Reset position if zoomed out completely
        if (closest === 1) {
          setPosition({ x: 0, y: 0 });
          x.set(0);
          y.set(0);
        }
      }
    };

    // Mouse wheel zoom
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newScale = Math.max(minScale, Math.min(maxScale, scale + delta));
        setScale(newScale);
        scaleValue.set(newScale);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [scale, isPanning, minScale, maxScale]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden touch-none ${className}`}
    >
      {/* Zoom indicator */}
      {scale > 1 && (
        <motion.div
          className="absolute top-4 right-4 bg-popover text-popover-foreground px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg border border-border z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          {scale.toFixed(1)}x
        </motion.div>
      )}

      {/* Zoomable content */}
      <motion.div
        style={{
          scale: scaleValue,
          x: position.x,
          y: position.y
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        {children}
      </motion.div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-center text-muted-foreground bg-popover/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/50">
        {scale === 1 ? "Pinch to zoom • Scroll with Ctrl/Cmd" : "Pan to explore • Pinch to zoom out"}
      </div>
    </div>
  );
}
