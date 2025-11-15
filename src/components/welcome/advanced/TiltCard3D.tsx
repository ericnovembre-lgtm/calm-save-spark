import { ReactNode, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { use3DTilt } from '@/hooks/use3DTilt';

interface TiltCard3DProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}

/**
 * Card with 3D tilt effect and parallax depth layers
 * Creates immersive perspective shift on mouse movement
 */
export const TiltCard3D = ({
  children,
  className = '',
  maxTilt = 12,
  glare = true,
}: TiltCard3DProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { tiltStyle, handleMouseMove, handleMouseLeave } = use3DTilt({
    maxTilt,
    perspective: 1200,
    scale: 1.03,
    speed: 400,
  });

  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMoveWithGlare = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMouseMove(e);
    
    if (glare && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setGlarePosition({ x, y });
    }
  };

  const handleMouseLeaveWithGlare = () => {
    handleMouseLeave();
    setIsHovered(false);
    setGlarePosition({ x: 50, y: 50 });
  };

  if (prefersReducedMotion) {
    return (
      <motion.div
        className={`relative ${className}`}
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={tiltStyle}
      onMouseMove={handleMouseMoveWithGlare}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeaveWithGlare}
    >
      {/* Glass morphism overlay */}
      {glare && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="absolute w-full h-full"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, 
                hsl(var(--accent) / 0.15) 0%, 
                transparent 50%)`,
              transition: 'background 0.1s ease',
            }}
          />
        </motion.div>
      )}
      
      {/* Shadow effect */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-2xl blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        style={{
          background: 'hsl(var(--foreground) / 0.2)',
          transform: 'translateY(8px)',
        }}
      />
      
      {children}
    </div>
  );
};
