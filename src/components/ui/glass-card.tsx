import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { cardHover } from "@/lib/motion-variants";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  enableTilt?: boolean;
  glowOnHover?: boolean;
  onClick?: () => void;
}

/**
 * GlassCard - Premium glass morphism card with 3D tilt effects
 * Features: backdrop blur, gradient borders, mouse-tracking 3D transforms
 */
export function GlassCard({ 
  children, 
  className = "", 
  enableTilt = true,
  glowOnHover = false,
  onClick 
}: GlassCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Mouse position tracking for 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring animations for smooth following
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || prefersReducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Normalize to -0.5 to 0.5 range
    const x = (e.clientX - centerX) / rect.width;
    const y = (e.clientY - centerY) / rect.height;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    if (!enableTilt || prefersReducedMotion) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      variants={!prefersReducedMotion ? cardHover : undefined}
      initial="rest"
      whileHover="hover"
      whileTap={!prefersReducedMotion ? "tap" : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={enableTilt && !prefersReducedMotion ? {
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      } : undefined}
      onClick={onClick}
  className={cn(
    // Phase 7: Enhanced glassmorphism
    "relative rounded-2xl",
    "bg-glass border border-glass-border",
    "backdrop-blur-glass shadow-glass",
    
    // Hover effects with depth
    "transition-all duration-300",
    "hover:shadow-glass-elevated hover:bg-glass-hover",
    "hover:border-glass-border-hover",
    
    // Gradient border shimmer
    "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
    "before:bg-gradient-to-br before:from-primary/20 before:via-transparent before:to-accent/20",
    "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
    "before:-z-10",
    
    // Glow effect
    glowOnHover && "hover:shadow-[0_0_30px_hsla(var(--primary),0.15)]",
    
    // Cursor
    onClick && "cursor-pointer active:scale-[0.98]",
    
    className
  )}
>
      {/* Shimmer overlay on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
          backgroundSize: "200% 100%"
        }}
        animate={{
          backgroundPosition: ["0% 0%", "200% 0%"]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
