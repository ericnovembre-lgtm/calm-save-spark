/**
 * Motion Variants Library
 * Orchestrated animation presets for premium UX
 */

// Standardized timing constants (in milliseconds)
export const TIMING = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  glacial: 1000
} as const;

export const fadeInUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: {
      duration: TIMING.slow / 1000,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: "blur(0px)",
    transition: {
      duration: TIMING.slow / 1000,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const cardHover = {
  rest: {
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    z: 0,
    transition: {
      duration: TIMING.normal / 1000,
      ease: [0.22, 1, 0.36, 1] as const
    }
  },
  hover: {
    scale: 1.02,
    z: 50,
    transition: {
      duration: TIMING.normal / 1000,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export const shimmer = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const float = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const glow = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(var(--primary-rgb), 0.2)",
      "0 0 40px rgba(var(--primary-rgb), 0.4)",
      "0 0 20px rgba(var(--primary-rgb), 0.2)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const ripple = {
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  }
};
