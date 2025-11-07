import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter = ({
  value,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: AnimatedCounterProps) => {
  const prefersReducedMotion = useReducedMotion();
  const spring = useSpring(0, { 
    duration: prefersReducedMotion ? 0 : duration * 1000,
    bounce: 0 
  });
  
  const display = useTransform(spring, (current) =>
    `${prefix}${current.toFixed(decimals)}${suffix}`
  );

  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  // For reduced motion, display value immediately
  if (prefersReducedMotion) {
    return (
      <span className={className}>
        {prefix}{value.toFixed(decimals)}{suffix}
      </span>
    );
  }

  return (
    <motion.span ref={nodeRef} className={className}>
      {display}
    </motion.span>
  );
};
