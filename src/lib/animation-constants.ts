/**
 * Centralized Animation Constants
 * Single source of truth for all animation timings and easings
 */

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  typing: 50, // Per character for typing animations
  celebration: 3000,
} as const;

export const ANIMATION_EASING = {
  smooth: [0.22, 1, 0.36, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  ease: [0.4, 0, 0.2, 1] as const,
} as const;

export const STAGGER_DELAY = {
  cards: 50,
  list: 30,
  grid: 40,
} as const;

export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: STAGGER_DELAY.cards / 1000,
      },
    },
  },
} as const;
