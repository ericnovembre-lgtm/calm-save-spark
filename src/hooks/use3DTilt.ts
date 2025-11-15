import { useReducedMotion } from './useReducedMotion';
import { useState, useCallback, useRef } from 'react';

interface TiltState {
  rotateX: number;
  rotateY: number;
  scale: number;
}

interface Use3DTiltOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
}

/**
 * Hook for 3D tilt effect on mouse move
 * Creates parallax effect following cursor
 */
export function use3DTilt({
  maxTilt = 15,
  perspective = 1000,
  scale = 1.05,
  speed = 400
}: Use3DTiltOptions = {}) {
  const prefersReducedMotion = useReducedMotion();
  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    scale: 1
  });
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * maxTilt;
    const rotateY = ((centerX - x) / centerX) * maxTilt;

    setTilt({
      rotateX,
      rotateY,
      scale
    });
  }, [prefersReducedMotion, maxTilt, scale]);

  const handleMouseLeave = useCallback(() => {
    if (prefersReducedMotion) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTilt({
        rotateX: 0,
        rotateY: 0,
        scale: 1
      });
    }, 100);
  }, [prefersReducedMotion]);

  const tiltStyle = prefersReducedMotion ? {} : {
    transform: `perspective(${perspective}px) rotateX(${-tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
    transition: `transform ${speed}ms cubic-bezier(0.22, 1, 0.36, 1)`
  };

  return {
    tilt,
    tiltStyle,
    handleMouseMove,
    handleMouseLeave
  };
}
