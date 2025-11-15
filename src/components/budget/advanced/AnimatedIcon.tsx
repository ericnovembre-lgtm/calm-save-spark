import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedIconProps {
  icon: LucideIcon;
  size?: number;
  state?: 'idle' | 'active' | 'success' | 'warning' | 'error';
  className?: string;
}

const stateVariants = {
  idle: {
    scale: 1,
    rotate: 0,
    filter: 'brightness(1) drop-shadow(0 0 0px hsl(var(--primary)))',
  },
  active: {
    scale: [1, 1.15, 1],
    rotate: [0, 5, -5, 0],
    filter: 'brightness(1.2) drop-shadow(0 0 8px hsl(var(--primary)))',
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2,
    }
  },
  success: {
    scale: [1, 1.3, 1],
    rotate: [0, 360],
    filter: 'brightness(1.4) drop-shadow(0 0 12px hsl(142 76% 36%))',
    transition: {
      duration: 0.5,
    }
  },
  warning: {
    scale: [1, 1.1, 1],
    filter: 'brightness(1.3) drop-shadow(0 0 10px hsl(48 96% 53%))',
    transition: {
      duration: 0.8,
      repeat: Infinity,
    }
  },
  error: {
    scale: [1, 1.2, 1],
    rotate: [-5, 5, -5],
    filter: 'brightness(1.3) drop-shadow(0 0 10px hsl(0 84% 60%))',
    transition: {
      duration: 0.4,
      repeat: 3,
    }
  }
};

export const AnimatedIcon = ({ 
  icon: Icon, 
  size = 24, 
  state = 'idle',
  className = ''
}: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? {} : stateVariants}
      initial="idle"
      animate={state}
      className={className}
    >
      <Icon size={size} />
    </motion.div>
  );
};
