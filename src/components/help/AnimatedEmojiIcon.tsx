import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedEmojiIconProps {
  emoji?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl'
};

export const AnimatedEmojiIcon = ({ 
  emoji = '🙎', 
  size = 'md',
  className = '' 
}: AnimatedEmojiIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isWaving, setIsWaving] = useState(false);

  // Schedule periodic waves every 30-45 seconds
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const scheduleWave = (): NodeJS.Timeout => {
      // Random interval between 30-45 seconds
      const randomDelay = 30000 + Math.random() * 15000;
      
      return setTimeout(() => {
        setIsWaving(true);
        
        // Wave duration: 1.2 seconds
        setTimeout(() => {
          setIsWaving(false);
        }, 1200);
      }, randomDelay);
    };
    
    const timeoutId = scheduleWave();
    
    return () => clearTimeout(timeoutId);
  }, [prefersReducedMotion, isWaving]);

  const emojiHover = {
    rest: { 
      scale: 1,
      rotate: 0
    },
    hover: { 
      scale: prefersReducedMotion ? 1 : 1.1,
      rotate: prefersReducedMotion ? 0 : [0, -5, 5, 0],
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  const waveAnimation = {
    rotate: [0, -15, 15, -10, 10, -5, 5, 0],
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1] as const,
      times: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1]
    }
  };

  return (
    <motion.div
      className={`flex items-center justify-center ${sizeMap[size]} ${className}`}
      variants={emojiHover}
      initial="rest"
      whileHover="hover"
      animate={isWaving && !prefersReducedMotion ? waveAnimation : undefined}
      whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
      role="img"
      aria-label="Help assistant icon"
    >
      {emoji}
    </motion.div>
  );
};
