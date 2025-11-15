import { ReactNode, ButtonHTMLAttributes } from 'react';
import { animated } from '@react-spring/web';
import { useMagneticEffect } from '@/hooks/welcome/useMagneticEffect';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from 'framer-motion';

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  strength?: number;
  radius?: number;
  variant?: 'default' | 'secondary' | 'outline';
}

/**
 * Interactive button with magnetic cursor attraction effect
 * Follows cursor with spring physics within defined radius
 */
export const MagneticButton = ({
  children,
  strength = 0.4,
  radius = 80,
  variant = 'default',
  className = '',
  ...props
}: MagneticButtonProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { elementRef, springs } = useMagneticEffect({ strength, radius, scale: 1.05 });

  const baseClasses = 'relative px-6 py-3 rounded-xl font-semibold transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:shadow-lg',
    secondary: 'bg-secondary text-secondary-foreground hover:shadow-md',
    outline: 'border-2 border-border text-foreground hover:bg-accent/30',
  };

  if (prefersReducedMotion) {
    return (
      <motion.button
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={props.onClick}
        disabled={props.disabled}
        type={props.type}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <animated.button
      ref={elementRef as any}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        transform: springs.x.to(
          (x) => springs.y.to(
            (y) => springs.scale.to(
              (s) => `translate3d(${x}px, ${y}px, 0) scale(${s})`
            )
          )
        ) as any,
      }}
      onClick={props.onClick}
      disabled={props.disabled}
      type={props.type}
    >
      {/* Ripple effect overlay */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 pointer-events-none"
        initial={false}
        whileHover={{ opacity: [0, 0.2, 0], scale: [0.8, 1.2, 1.4] }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)',
        }}
      />
      <span className="relative z-10">{children}</span>
    </animated.button>
  );
};
