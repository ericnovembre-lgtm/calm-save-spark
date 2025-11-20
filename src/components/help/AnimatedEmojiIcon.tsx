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

  return (
    <motion.div
      className={`flex items-center justify-center ${sizeMap[size]} ${className}`}
      variants={emojiHover}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
      role="img"
      aria-label="Help assistant icon"
    >
      {emoji}
    </motion.div>
  );
};
