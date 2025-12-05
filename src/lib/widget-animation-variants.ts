/**
 * Widget animation variants following Data Futurism aesthetic
 * Subtle, refined micro-animations for dashboard widgets
 */

import { Variants, TargetAndTransition } from 'framer-motion';

// Duration constants (in seconds)
export const ANIMATION_DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
} as const;

// Easing curves
export const ANIMATION_EASING = {
  smooth: [0.22, 1, 0.36, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
} as const;

// Widget container animations
export const widgetContainerVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10,
    scale: 0.98 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASING.smooth,
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.98,
    transition: {
      duration: ANIMATION_DURATION.fast,
    }
  }
};

// Stagger children animation
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  }
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASING.smooth,
    }
  }
};

// Value change flash effect
export const valueUpdateFlash: TargetAndTransition = {
  backgroundColor: ['hsl(var(--primary) / 0.1)', 'hsl(var(--primary) / 0)'],
  transition: { duration: 0.6 }
};

export const valueIncreaseFlash: TargetAndTransition = {
  backgroundColor: ['hsl(142 71% 45% / 0.15)', 'hsl(142 71% 45% / 0)'],
  transition: { duration: 0.6 }
};

export const valueDecreaseFlash: TargetAndTransition = {
  backgroundColor: ['hsl(0 84% 60% / 0.15)', 'hsl(0 84% 60% / 0)'],
  transition: { duration: 0.6 }
};

// Progress bar animation
export const progressBarVariants: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: ANIMATION_EASING.smooth,
    }
  })
};

// Drag animation for reordering
export const draggableVariants: Variants = {
  idle: { 
    scale: 1,
    boxShadow: '0 0 0 0 rgba(0,0,0,0)',
    zIndex: 1,
  },
  dragging: { 
    scale: 1.03,
    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
    zIndex: 50,
    cursor: 'grabbing',
  }
};

// Pin indicator animation
export const pinIndicatorVariants: Variants = {
  unpinned: { 
    scale: 1,
    rotate: 0,
    color: 'hsl(var(--muted-foreground))'
  },
  pinned: { 
    scale: [1, 1.2, 1],
    rotate: [0, -15, 0],
    color: 'hsl(45 93% 47%)', // Gold accent
    transition: {
      duration: 0.4,
      ease: ANIMATION_EASING.bounce,
    }
  }
};

// Pulse animation for updates
export const pulseVariants: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    }
  }
};

// Glow effect for important updates
export const glowVariants: Variants = {
  initial: { 
    boxShadow: '0 0 0 0 hsl(var(--primary) / 0)' 
  },
  glow: {
    boxShadow: [
      '0 0 0 0 hsl(var(--primary) / 0)',
      '0 0 20px 5px hsl(var(--primary) / 0.3)',
      '0 0 0 0 hsl(var(--primary) / 0)',
    ],
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
    }
  }
};

// Skeleton loading animation
export const skeletonVariants: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  }
};

// Number counter config
export const numberCounterConfig = {
  duration: ANIMATION_DURATION.slow,
  separator: ',',
  decimals: 2,
  decimal: '.',
  prefix: '$',
};

// Reduced motion alternatives
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};
