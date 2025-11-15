import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ScanLineOverlayProps {
  intensity?: 'low' | 'medium' | 'high';
  color?: string;
}

export const ScanLineOverlay = ({ 
  intensity = 'medium',
  color = 'hsl(var(--primary))'
}: ScanLineOverlayProps) => {
  const prefersReducedMotion = useReducedMotion();

  const opacityMap = {
    low: 0.03,
    medium: 0.05,
    high: 0.08
  };

  if (prefersReducedMotion) return null;

  return (
    <>
      {/* Horizontal scan lines */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${color} 2px,
            ${color} 3px
          )`,
          opacity: opacityMap[intensity]
        }}
      />
      
      {/* Animated scan beam */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] pointer-events-none z-10"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 20px ${color}`,
          opacity: 0.3
        }}
        animate={{
          top: ['-2px', '100%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Vertical scan effect */}
      <motion.div
        className="absolute top-0 bottom-0 w-[100px] pointer-events-none z-10"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}15, transparent)`,
          filter: 'blur(20px)',
        }}
        animate={{
          left: ['-100px', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 2
        }}
      />
    </>
  );
};
