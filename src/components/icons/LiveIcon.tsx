import { motion, useReducedMotion } from 'framer-motion';
import { LucideIcon, LucideProps } from 'lucide-react';
import { forwardRef, useMemo } from 'react';

export type IconAnimation =
  | 'heartbeat'   // Pulse scale for health indicators
  | 'floating'    // Gentle y-axis bob for money icons
  | 'spinning'    // Rotation for loading states
  | 'pulsing'     // Opacity pulse for notifications
  | 'bouncing'    // Spring bounce for success
  | 'shaking'     // Horizontal shake for errors
  | 'breathing'   // Subtle scale for ambient
  | 'none';

interface LiveIconProps extends Omit<LucideProps, 'ref'> {
  icon: LucideIcon;
  animation?: IconAnimation;
  duration?: number;
  intensity?: number;
  trigger?: 'mount' | 'hover' | 'always';
  colorTransition?: {
    from: string;
    to: string;
    duration?: number;
  };
}

const animationVariants = {
  heartbeat: {
    scale: [1, 1.15, 1, 1.1, 1],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      repeatDelay: 0.8,
      ease: 'easeInOut',
    },
  },
  floating: {
    y: [0, -4, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  spinning: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  pulsing: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  bouncing: {
    y: [0, -8, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },
  shaking: {
    x: [0, -3, 3, -3, 3, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
  breathing: {
    scale: [1, 1.05, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  none: {},
};

/**
 * LiveIcon - Animated icon wrapper for Lucide icons
 * Adds contextual animations with reduced motion support
 */
export const LiveIcon = forwardRef<SVGSVGElement, LiveIconProps>(
  (
    {
      icon: Icon,
      animation = 'none',
      duration,
      intensity = 1,
      trigger = 'always',
      colorTransition,
      className,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();

    const animationConfig = useMemo(() => {
      if (prefersReducedMotion || animation === 'none') {
        return {};
      }

      const baseVariant = animationVariants[animation];
      if (!baseVariant || !baseVariant.transition) {
        return {};
      }

      // Apply intensity and custom duration
      const modifiedVariant = { ...baseVariant };
      if (duration && modifiedVariant.transition) {
        modifiedVariant.transition = {
          ...modifiedVariant.transition,
          duration,
        };
      }

      // Apply intensity to movement values
      if (intensity !== 1) {
        if ('y' in modifiedVariant && Array.isArray(modifiedVariant.y)) {
          modifiedVariant.y = modifiedVariant.y.map((v: number) => v * intensity);
        }
        if ('x' in modifiedVariant && Array.isArray(modifiedVariant.x)) {
          modifiedVariant.x = modifiedVariant.x.map((v: number) => v * intensity);
        }
        if ('scale' in modifiedVariant && Array.isArray(modifiedVariant.scale)) {
          modifiedVariant.scale = modifiedVariant.scale.map((v: number) =>
            v === 1 ? 1 : 1 + (v - 1) * intensity
          );
        }
      }

      return modifiedVariant;
    }, [animation, duration, intensity, prefersReducedMotion]);

  const colorAnimationConfig = useMemo(() => {
    if (!colorTransition || prefersReducedMotion) return {};

    return {
      color: [colorTransition.from, colorTransition.to],
      transition: {
        duration: colorTransition.duration || 2,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: 'easeInOut' as const,
      },
    };
  }, [colorTransition, prefersReducedMotion]);

    const mergedAnimation = {
      ...animationConfig,
      ...colorAnimationConfig,
    };

    if (trigger === 'hover') {
      return (
        <motion.span
          className="inline-flex"
          whileHover={mergedAnimation}
          initial={{ scale: 1, opacity: 1 }}
        >
          <Icon ref={ref} className={className} {...props} />
        </motion.span>
      );
    }

    if (prefersReducedMotion || animation === 'none') {
      return <Icon ref={ref} className={className} {...props} />;
    }

    return (
      <motion.span
        className="inline-flex"
        animate={mergedAnimation}
        initial={{ scale: 1, opacity: 1, y: 0, x: 0, rotate: 0 }}
      >
        <Icon ref={ref} className={className} {...props} />
      </motion.span>
    );
  }
);

LiveIcon.displayName = 'LiveIcon';

// Preset combinations for common use cases
export const iconPresets = {
  loading: { animation: 'spinning' as const, duration: 0.8 },
  success: { animation: 'bouncing' as const, intensity: 1.2 },
  error: { animation: 'shaking' as const, intensity: 1.5 },
  notification: { animation: 'pulsing' as const },
  money: { animation: 'floating' as const, intensity: 0.8 },
  health: { animation: 'heartbeat' as const },
  ambient: { animation: 'breathing' as const, intensity: 0.6 },
};
