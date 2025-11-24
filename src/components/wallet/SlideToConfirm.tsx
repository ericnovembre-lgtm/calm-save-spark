import { useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SlideToConfirmProps {
  onConfirm: () => void;
  disabled?: boolean;
  label?: string;
}

export function SlideToConfirm({
  onConfirm,
  disabled = false,
  label = "Slide to Confirm",
}: SlideToConfirmProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  
  const trackWidth = 300; // Base track width
  const handleWidth = 60;
  const threshold = trackWidth - handleWidth - 20;

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    if (info.offset.x > threshold && !disabled) {
      onConfirm();
      setDragX(0);
    } else {
      setDragX(0);
    }
  };

  const progress = Math.min(dragX / threshold, 1);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative h-16 bg-muted/20 rounded-2xl overflow-hidden border-2 border-border">
        {/* Progress Background */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent/30"
          style={{ width: `${progress * 100}%` }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: progress > 0.8 ? 0.6 : 0.3 }}
        />
        
        {/* Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-sm font-medium text-muted-foreground">
            {progress > 0.8 ? "Release to Confirm" : label}
          </span>
        </div>
        
        {/* Draggable Handle */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: threshold }}
          dragElastic={0}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          onDrag={(_, info) => setDragX(info.offset.x)}
          animate={prefersReducedMotion ? {} : {
            x: dragX,
            scale: isDragging ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute left-2 top-2 bottom-2 w-14 bg-primary rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
          style={{ touchAction: 'none' }}
        >
          <ChevronRight className="w-6 h-6 text-primary-foreground" />
        </motion.div>
        
        {/* Chevron Hints */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 opacity-30 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={prefersReducedMotion ? {} : {
                x: [0, 5, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}