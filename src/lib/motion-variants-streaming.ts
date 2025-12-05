import { Variants } from 'framer-motion';

// Token-by-token reveal animation
export const tokenReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
  },
};

export const tokenChild: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.1 },
  },
};

// Word-by-word reveal
export const wordReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const wordChild: Variants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

// Content materialize (skeleton → content)
export const materialize: Variants = {
  skeleton: { 
    opacity: 1,
    filter: 'blur(8px)',
    scale: 0.98,
  },
  content: { 
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Pulse on data update
export const liveUpdatePulse: Variants = {
  idle: { scale: 1, boxShadow: '0 0 0 0 rgba(6, 182, 212, 0)' },
  pulse: {
    scale: [1, 1.02, 1],
    boxShadow: [
      '0 0 0 0 rgba(6, 182, 212, 0.4)',
      '0 0 0 10px rgba(6, 182, 212, 0)',
      '0 0 0 0 rgba(6, 182, 212, 0)',
    ],
    transition: { duration: 0.6 },
  },
};

// Number counter animation
export const numberCounter: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 },
  },
  update: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.3 },
  },
};

// Flash highlight on change
export const flashHighlight: Variants = {
  idle: { backgroundColor: 'transparent' },
  positive: {
    backgroundColor: ['rgba(16, 185, 129, 0.3)', 'transparent'],
    transition: { duration: 0.6 },
  },
  negative: {
    backgroundColor: ['rgba(244, 63, 94, 0.3)', 'transparent'],
    transition: { duration: 0.6 },
  },
};

// Progress bar slide
export const progressSlide: Variants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: { 
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// Stagger list reveal
export const staggerList: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
};

// Stream progress bar
export const streamProgress: Variants = {
  initial: { 
    width: 0,
    background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 50%, #06b6d4 100%)',
    backgroundSize: '200% 100%',
  },
  animate: (progress: number) => ({
    width: `${progress}%`,
    backgroundPosition: ['0% 0%', '100% 0%'],
    transition: {
      width: { duration: 0.3 },
      backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
    },
  }),
};

// Neural network thinking animation
export const neuralThinking: Variants = {
  idle: { pathLength: 0, opacity: 0 },
  thinking: {
    pathLength: [0, 1, 0],
    opacity: [0.2, 1, 0.2],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Breathing glow effect
export const breathingGlow: Variants = {
  idle: { 
    boxShadow: '0 0 0 0 rgba(6, 182, 212, 0)',
  },
  breathing: {
    boxShadow: [
      '0 0 10px 2px rgba(6, 182, 212, 0.2)',
      '0 0 20px 4px rgba(6, 182, 212, 0.4)',
      '0 0 10px 2px rgba(6, 182, 212, 0.2)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Typing cursor blink
export const cursorBlink: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

// Card entrance with stagger
export const cardEntrance: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};
