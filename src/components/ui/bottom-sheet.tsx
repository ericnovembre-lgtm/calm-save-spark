import * as React from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.9, 0.5],
  className
}: BottomSheetProps) {
  const prefersReducedMotion = useReducedMotion();
  const [currentSnap, setCurrentSnap] = React.useState(snapPoints[0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Close if dragged down significantly
    if (offset > 100 || velocity > 500) {
      onClose();
      return;
    }

    // Snap to nearest point
    const windowHeight = window.innerHeight;
    const currentPosition = 1 - currentSnap;
    const pixelOffset = currentPosition * windowHeight + offset;
    const percentOffset = pixelOffset / windowHeight;

    const nearest = snapPoints.reduce((prev, curr) => {
      const prevDiff = Math.abs((1 - prev) - percentOffset);
      const currDiff = Math.abs((1 - curr) - percentOffset);
      return currDiff < prevDiff ? curr : prev;
    });

    setCurrentSnap(nearest);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: `${(1 - currentSnap) * 100}%` }}
            exit={{ y: "100%" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={handleDragEnd}
            transition={prefersReducedMotion ? { duration: 0 } : { 
              type: "spring", 
              damping: 30, 
              stiffness: 300 
            }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-background rounded-t-3xl shadow-2xl",
              "max-h-[90vh]",
              className
            )}
          >
            {/* Drag Handle */}
            <div className="flex items-center justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-display font-semibold text-foreground">
                  {title}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
