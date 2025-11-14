import { useEffect, useRef } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({ 
  value, 
  decimals = 2, 
  prefix = "",
  suffix = "",
  className = "",
  duration = 1000
}: AnimatedCounterProps) {
  const prefersReducedMotion = useReducedMotion();
  const previousValue = useRef(value);

  const { number } = useSpring({
    from: { number: previousValue.current },
    to: { number: value },
    config: { 
      tension: 50, 
      friction: 10,
      mass: 1
    },
    immediate: prefersReducedMotion
  });

  useEffect(() => {
    previousValue.current = value;
  }, [value]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      <animated.span>
        {number.to(n => n.toFixed(decimals))}
      </animated.span>
      {suffix}
    </span>
  );
}
