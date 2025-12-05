/**
 * Dashboard-Specific Motion Variants
 * Cinematic animations for the generative dashboard experience
 */

import { Variants } from 'framer-motion';

// Widget data update pulse effect
export const widgetPulse: Variants = {
  idle: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.02, 1],
    opacity: [1, 0.9, 1],
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Animated number counter (use with useSpring)
export const countUpConfig = {
  stiffness: 100,
  damping: 30,
  mass: 1,
};

// Goal/budget progress bar fill with liquid effect
export const progressFill: Variants = {
  empty: { scaleX: 0, originX: 0 },
  filled: (progress: number) => ({
    scaleX: progress,
    originX: 0,
    transition: {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// 3D tilt effect on widget hover (values are multipliers for mouse position)
export const cardHover3D = {
  rest: {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Sequential widget appearance
export const staggerReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Data refresh shimmer effect
export const refreshShimmer: Variants = {
  idle: {
    backgroundPosition: '-200% 0',
  },
  shimmer: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

// Alert attention-grabbing pulse
export const attentionPulse: Variants = {
  idle: {
    boxShadow: '0 0 0 0 hsla(var(--destructive) / 0)',
  },
  alert: {
    boxShadow: [
      '0 0 0 0 hsla(var(--destructive) / 0.4)',
      '0 0 0 10px hsla(var(--destructive) / 0)',
    ],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeOut',
    },
  },
};

// Widget entrance from different directions based on grid position
export const slideInFromEdge: Variants = {
  hiddenLeft: { opacity: 0, x: -30 },
  hiddenRight: { opacity: 0, x: 30 },
  hiddenTop: { opacity: 0, y: -30 },
  hiddenBottom: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Flash highlight on value change
export const flashHighlight: Variants = {
  idle: {
    backgroundColor: 'transparent',
  },
  positive: {
    backgroundColor: [
      'hsla(142, 71%, 45%, 0.3)',
      'hsla(142, 71%, 45%, 0)',
    ],
    transition: { duration: 0.6 },
  },
  negative: {
    backgroundColor: [
      'hsla(0, 72%, 51%, 0.3)',
      'hsla(0, 72%, 51%, 0)',
    ],
    transition: { duration: 0.6 },
  },
};

// Floating entrance for hero widgets
export const heroEntrance: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Subtle breathing for ambient elements
export const ambientBreathing: Variants = {
  breathe: {
    scale: [1, 1.02, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Glow effect for important widgets
export const glowEffect: Variants = {
  idle: {
    filter: 'drop-shadow(0 0 0 hsla(var(--primary) / 0))',
  },
  glow: {
    filter: [
      'drop-shadow(0 0 8px hsla(var(--primary) / 0.3))',
      'drop-shadow(0 0 16px hsla(var(--primary) / 0.2))',
      'drop-shadow(0 0 8px hsla(var(--primary) / 0.3))',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Card press effect
export const cardPress: Variants = {
  rest: { scale: 1 },
  pressed: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: 'easeOut',
    },
  },
};

// List item stagger
export const listItemStagger: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

// Notification badge pop
export const badgePop: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
};

// Wave effect for progress bars
export const waveProgress = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Typewriter text reveal
export const typewriterReveal: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.03,
    },
  }),
};
