/**
 * Micro-interactions utility components for enhanced UX
 * These small animations and effects make the interface feel more responsive and alive
 */

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

/**
 * Adds a subtle scale effect on hover
 */
export const HoverScale = ({ children, className, scale = 1.02 }: HoverScaleProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("inline-block", className)}
      whileHover={prefersReducedMotion ? {} : { scale }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

/**
 * Button that follows cursor within its bounds
 */
export const MagneticButton = ({ children, className, strength = 0.3 }: MagneticButtonProps) => {
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    e.currentTarget.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "translate(0px, 0px)";
  };

  return (
    <div
      className={cn("inline-block transition-transform duration-200", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  yOffset?: number;
  duration?: number;
}

/**
 * Element that floats up and down subtly
 */
export const FloatingElement = ({ 
  children, 
  className, 
  yOffset = 10, 
  duration = 3 
}: FloatingElementProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={prefersReducedMotion ? {} : {
        y: [0, -yOffset, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};

interface PulseGlowProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

/**
 * Adds a pulsing glow effect around an element
 */
export const PulseGlow = ({ children, className, color = "var(--primary)" }: PulseGlowProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("relative", className)}
      animate={prefersReducedMotion ? {} : {
        boxShadow: [
          `0 0 0 0 ${color}40`,
          `0 0 0 10px ${color}00`,
          `0 0 0 0 ${color}00`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    >
      {children}
    </motion.div>
  );
};

interface ShakeOnErrorProps {
  children: ReactNode;
  isError?: boolean;
  className?: string;
}

/**
 * Shakes element when error occurs
 */
export const ShakeOnError = ({ children, isError, className }: ShakeOnErrorProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={isError && !prefersReducedMotion ? {
        x: [0, -10, 10, -10, 10, 0],
      } : {}}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
};

interface SuccessCheckmarkProps {
  show: boolean;
  className?: string;
}

/**
 * Animated checkmark that appears on success
 */
export const SuccessCheckmark = ({ show, className }: SuccessCheckmarkProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (!show) return null;

  return (
    <motion.svg
      className={cn("w-6 h-6 text-success", className)}
      viewBox="0 0 24 24"
      fill="none"
      initial={prefersReducedMotion ? false : { scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 0.6 }}
    >
      <motion.path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </motion.svg>
  );
};

interface TypingIndicatorProps {
  className?: string;
}

/**
 * Animated typing indicator (three dots)
 */
export const TypingIndicator = ({ className }: TypingIndicatorProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("flex gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-current"
          animate={prefersReducedMotion ? {} : {
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
};
