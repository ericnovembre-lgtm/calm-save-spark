import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface WaveformChartProps {
  data: number[];
  height?: number;
  barWidth?: number;
  gap?: number;
  color?: string;
  animate?: boolean;
}

export const WaveformChart = ({
  data,
  height = 100,
  barWidth = 4,
  gap = 2,
  color = 'hsl(var(--primary))',
  animate = true
}: WaveformChartProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [animatedData, setAnimatedData] = useState(data.map(() => 0));

  useEffect(() => {
    if (!animate || prefersReducedMotion) {
      setAnimatedData(data);
      return;
    }

    const timeout = setTimeout(() => {
      setAnimatedData(data);
    }, 100);

    return () => clearTimeout(timeout);
  }, [data, animate, prefersReducedMotion]);

  const maxValue = Math.max(...data, 1);
  const normalizedData = animatedData.map(val => (val / maxValue) * height);

  return (
    <div className="flex items-end gap-[2px] justify-center" style={{ height }}>
      {normalizedData.map((value, index) => {
        const barHeight = Math.max(value, 2);
        
        return (
          <motion.div
            key={index}
            className="rounded-full"
            style={{
              width: barWidth,
              backgroundColor: color,
              boxShadow: `0 0 ${barWidth * 2}px ${color}40`,
            }}
            initial={{ height: 2 }}
            animate={{ 
              height: barHeight,
              filter: [
                'brightness(1)',
                'brightness(1.3)',
                'brightness(1)'
              ]
            }}
            transition={{
              height: {
                duration: 0.5,
                delay: index * 0.02,
                ease: [0.22, 1, 0.36, 1]
              },
              filter: {
                duration: 2,
                repeat: Infinity,
                delay: index * 0.1
              }
            }}
          />
        );
      })}
    </div>
  );
};
