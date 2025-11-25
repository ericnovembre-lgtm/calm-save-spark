import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, PanInfo } from 'framer-motion';
import { X, RotateCw, ZoomIn, ZoomOut, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CardInspectionModeProps {
  children: React.ReactNode;
  isActive: boolean;
  onClose: () => void;
}

export function CardInspectionMode({ children, isActive, onClose }: CardInspectionModeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [zoom, setZoom] = useState(1);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Motion values for rotation (unbounded 360°)
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  // Spring physics for smooth rotation
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate || prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      if (!isDragging) {
        rotateY.set(rotateY.get() + 1);
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, [autoRotate, isDragging, rotateY, prefersReducedMotion]);

  // Keyboard controls
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 10;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          rotateX.set(rotateX.get() - step);
          break;
        case 'ArrowDown':
          e.preventDefault();
          rotateX.set(rotateX.get() + step);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          rotateY.set(rotateY.get() - step);
          break;
        case 'ArrowRight':
          e.preventDefault();
          rotateY.set(rotateY.get() + step);
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, rotateX, rotateY, onClose]);

  if (!isActive) return null;

  const handleDrag = (_: any, info: PanInfo) => {
    // 1px of drag = 0.5 degrees of rotation
    rotateY.set(rotateY.get() + info.delta.x * 0.5);
    rotateX.set(rotateX.get() - info.delta.y * 0.5);
  };

  const handleReset = () => {
    if (prefersReducedMotion) {
      rotateX.set(0);
      rotateY.set(0);
    } else {
      rotateX.set(0);
      rotateY.set(0);
    }
    setZoom(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
      role="dialog"
      aria-label="Card inspection mode"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Control Panel */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 bg-background/95 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">X: {Math.round(springRotateX.get())}°</span>
          <span className="text-xs text-muted-foreground">Y: {Math.round(springRotateY.get())}°</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCw className="w-4 h-4" />
          Reset
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAutoRotate(!autoRotate)}
          className="gap-2"
        >
          {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {autoRotate ? 'Pause' : 'Auto'}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 bg-background/95 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        
        <Slider
          value={[zoom]}
          onValueChange={(value) => setZoom(value[0])}
          min={0.5}
          max={2}
          step={0.1}
          className="w-32"
        />
        
        <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* Card with 3D Transform */}
      <motion.div
        drag
        dragElastic={0}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDrag={handleDrag}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onDoubleClick={handleReset}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          scale: zoom,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        className="select-none touch-none"
      >
        {children}
      </motion.div>

      {/* Instructions */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center text-xs text-muted-foreground space-y-1">
        <p>Drag to rotate • Arrow keys to move • Double-click to reset</p>
        <p>Esc to close</p>
      </div>
    </motion.div>
  );
}
