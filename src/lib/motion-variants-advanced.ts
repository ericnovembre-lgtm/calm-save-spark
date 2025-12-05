/**
 * Advanced Motion Variants for Premium UX
 * World-class animation presets for $ave+ Goals
 */

import { TIMING } from './motion-variants';

export const card3D = {
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
    scale: 1.03,
    z: 50,
    transition: {
      duration: TIMING.normal / 1000,
      ease: [0.22, 1, 0.36, 1] as const
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: TIMING.fast / 1000,
      ease: "easeOut" as const
    }
  }
};

export const liquidFill = {
  initial: { scaleY: 0, originY: 1 },
  animate: (progress: number) => ({
    scaleY: progress / 100,
    transition: {
      duration: 1.5,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.2
    }
  })
};

export const confettiBurst = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 0],
    transition: {
      duration: 1.5,
      times: [0, 0.6, 1],
      ease: "easeOut"
    }
  }
};

export const pageCurl = {
  initial: { rotateY: 0, opacity: 1 },
  exit: {
    rotateY: -90,
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const
    }
  },
  enter: {
    rotateY: 90,
    opacity: 0
  },
  animate: {
    rotateY: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export const slideStack = {
  initial: (i: number) => ({
    y: i * -8,
    scale: 1 - i * 0.05,
    opacity: 1 - i * 0.2,
    zIndex: 100 - i
  }),
  hover: (i: number) => ({
    y: i * -40,
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
      delay: i * 0.05
    }
  })
};

export const flyIn = {
  initial: (direction: 'left' | 'right' | 'top' | 'bottom' = 'bottom') => {
    const positions = {
      left: { x: -100, y: 0 },
      right: { x: 100, y: 0 },
      top: { x: 0, y: -100 },
      bottom: { x: 0, y: 100 }
    };
    return {
      ...positions[direction],
      opacity: 0,
      scale: 0.8
    };
  },
  animate: {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300
    }
  }
};

export const pulseGlow = {
  animate: {
    boxShadow: [
      "0 0 20px hsl(var(--primary) / 0.2)",
      "0 0 40px hsl(var(--primary) / 0.4)",
      "0 0 20px hsl(var(--primary) / 0.2)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const morphCard = {
  grid: {
    width: "100%",
    height: "auto",
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  expanded: {
    width: "100vw",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const particleFloat = {
  animate: {
    y: [0, -20, 0],
    x: [0, 10, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const counterRoll = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
  transition: {
    type: "spring",
    damping: 25,
    stiffness: 400
  }
};

export const radialMenu = {
  closed: {
    scale: 0,
    rotate: -180,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  open: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.05
    }
  }
};

export const ribbonUnfurl = {
  initial: { scaleX: 0, originX: 0 },
  animate: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// ============================================
// DATA FUTURISM ANIMATIONS
// ============================================

/**
 * Glassmorphism hover effect for widgets
 */
export const glassHover = {
  rest: {
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  },
  hover: {
    scale: 1.01,
    y: -2,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
};

/**
 * Bento grid item entrance with blur
 */
export const bentoItemVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    filter: 'blur(10px)'
  },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

/**
 * Hero card breathing animation
 */
export const heroBreathing = {
  animate: {
    scale: [1, 1.005, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Aurora blob floating animation
 */
export const auroraFloat = {
  animate: {
    x: [0, 30, 0],
    y: [0, 20, 0],
    scale: [1, 1.2, 1],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Story bubble entrance
 */
export const storyBubbleVariants = {
  hidden: { 
    scale: 0, 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  hover: {
    scale: 1.08,
    y: -4,
    transition: { type: 'spring', stiffness: 400 }
  },
  tap: {
    scale: 0.95
  }
};

/**
 * Story ring rotation
 */
export const storyRingRotate = {
  animate: {
    rotate: 360,
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

/**
 * Glow pulse for story bubbles
 */
export const storyGlowPulse = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};
