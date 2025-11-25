import { useReducedMotion } from './useReducedMotion';
import { useState, useCallback, useRef } from 'react';

interface TiltState {
  rotateX: number;
  rotateY: number;
  scale: number;
  sheenX: number;
  sheenY: number;
}

interface Use3DTiltOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  stiffness?: number;
  damping?: number;
}

/**
 * Enhanced hook for volumetric 3D tilt effect
 * Adds sheen tracking for realistic metal reflections
 */
export function use3DTilt({
  maxTilt = 15,
  perspective = 1000,
  scale = 1.05,
  speed = 400,
  stiffness = 300,
  damping = 20
}: Use3DTiltOptions = {}) {
  const prefersReducedMotion = useReducedMotion();
  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    sheenX: 50,
    sheenY: 50
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

    // Sheen moves opposite to tilt for realistic reflection
    const sheenX = 50 + ((x - centerX) / rect.width) * 50;
    const sheenY = 50 + ((y - centerY) / rect.height) * 50;

    setTilt({
      rotateX,
      rotateY,
      scale,
      sheenX,
      sheenY
    });
  }, [prefersReducedMotion, maxTilt, scale]);

  const handleMouseLeave = useCallback(() => {
    if (prefersReducedMotion) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTilt({
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        sheenX: 50,
        sheenY: 50
      });
    }, 100);
  }, [prefersReducedMotion]);

  const tiltStyle = prefersReducedMotion ? {} : {
    transform: `perspective(${perspective}px) rotateX(${-tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
    transition: `transform ${speed}ms cubic-bezier(0.22, 1, 0.36, 1)`
  };

  const sheenStyle = {
    background: `radial-gradient(circle at ${tilt.sheenX}% ${tilt.sheenY}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 50%, transparent 70%)`,
    transition: `background ${speed}ms cubic-bezier(0.22, 1, 0.36, 1)`
  };

  return {
    tilt,
    tiltStyle,
    sheenStyle,
    handleMouseMove,
    handleMouseLeave
  };
}
