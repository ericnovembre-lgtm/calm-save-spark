import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useState } from 'react';

interface HolographicButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export function HolographicButton({ children, ...props }: HolographicButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative"
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Animated rainbow border */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-lg opacity-75 blur"
          animate={isHovered ? {
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            backgroundSize: '200% 200%',
          }}
        />
      )}
      
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-md rounded-lg" />
      
      {/* Button */}
      <Button 
        {...props}
        className="relative bg-primary/90 hover:bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        {/* Shimmer effect */}
        {!prefersReducedMotion && isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 0.6,
              ease: 'easeInOut',
            }}
          />
        )}
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  );
}
