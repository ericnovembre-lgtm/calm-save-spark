import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface DataPoint {
  [key: string]: any;
}

interface InteractiveChartProps {
  children: ReactNode;
  data: DataPoint[];
  onDataPointHover?: (point: DataPoint | null, index: number | null) => void;
  showReadout?: boolean;
  className?: string;
}

export function InteractiveChart({ 
  children, 
  data,
  onDataPointHover,
  showReadout = true,
  className = ''
}: InteractiveChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleMouseMove = (point: DataPoint | null, index: number | null) => {
    setHoveredPoint(point);
    setHoveredIndex(index);
    onDataPointHover?.(point, index);
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className="relative"
        onMouseLeave={() => handleMouseMove(null, null)}
      >
        {children}
      </div>

      {showReadout && (
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute top-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg min-w-[200px] z-10"
            >
              <div className="space-y-2">
                {Object.entries(hoveredPoint).map(([key, value]) => {
                  if (key === 'index' || typeof value === 'object') return null;
                  
                  return (
                    <div key={key} className="flex justify-between items-center gap-4">
                      <span className="text-sm text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {typeof value === 'number' ? value.toFixed(2) : value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
