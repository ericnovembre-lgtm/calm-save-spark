import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

export interface ButtonRippleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  rippleColor?: string;
  enableHaptic?: boolean;
}

export const ButtonRippleEnhanced = React.forwardRef<HTMLButtonElement, ButtonRippleProps>(
  ({ className, variant = "default", size = "md", rippleColor, enableHaptic = true, onClick, children, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const { triggerHaptic } = useHapticFeedback();
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!prefersReducedMotion) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples((prev) => [...prev, { x, y, id }]);

        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
        }, 600);
      }

      if (enableHaptic) {
        triggerHaptic("light");
      }

      onClick?.(e);
    };

    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    };

    const sizeClasses = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 py-2",
      lg: "h-11 px-8 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-md font-medium transition-all overflow-hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        onClick={handleClick}
        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        disabled={props.disabled}
        type={props.type}
        style={props.style}
      >
        {/* Content */}
        <span className="relative z-10">{children}</span>

        {/* Ripple effects */}
        {!prefersReducedMotion && ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              background: rippleColor || "rgba(255, 255, 255, 0.5)",
            }}
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{
              width: 200,
              height: 200,
              opacity: 0,
              x: -100,
              y: -100,
            }}
            transition={{ duration: 0.6 }}
          />
        ))}

        {/* Shine effect on hover */}
        {!prefersReducedMotion && (
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          />
        )}
      </motion.button>
    );
  }
);

ButtonRippleEnhanced.displayName = "ButtonRippleEnhanced";
