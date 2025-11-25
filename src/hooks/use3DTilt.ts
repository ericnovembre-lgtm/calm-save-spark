import { useReducedMotion } from './useReducedMotion';
import { useState, useCallback, useRef } from 'react';
import { useSpring, useMotionValue } from 'framer-motion';

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
  
  // Use Framer Motion springs for heavy metal feel
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scaleValue = useMotionValue(1);
  const sheenX = useMotionValue(50);
  const sheenY = useMotionValue(50);

  const springRotateX = useSpring(rotateX, { stiffness, damping });
  const springRotateY = useSpring(rotateY, { stiffness, damping });
  const springScale = useSpring(scaleValue, { stiffness, damping });
  const springSheenX = useSpring(sheenX, { stiffness, damping });
  const springSheenY = useSpring(sheenY, { stiffness, damping });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const calculatedRotateX = ((y - centerY) / centerY) * maxTilt;
    const calculatedRotateY = ((centerX - x) / centerX) * maxTilt;

    // Sheen moves opposite to tilt for realistic reflection
    const calculatedSheenX = 50 + ((x - centerX) / rect.width) * 50;
    const calculatedSheenY = 50 + ((y - centerY) / rect.height) * 50;

    // Update motion values - springs will handle smooth interpolation
    rotateX.set(calculatedRotateX);
    rotateY.set(calculatedRotateY);
    scaleValue.set(scale);
    sheenX.set(calculatedSheenX);
    sheenY.set(calculatedSheenY);
  }, [prefersReducedMotion, maxTilt, scale, rotateX, rotateY, scaleValue, sheenX, sheenY]);

  const handleMouseLeave = useCallback(() => {
    if (prefersReducedMotion) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Spring back to rest position with heavy metal feel
      rotateX.set(0);
      rotateY.set(0);
      scaleValue.set(1);
      sheenX.set(50);
      sheenY.set(50);
    }, 100);
  }, [prefersReducedMotion, rotateX, rotateY, scaleValue, sheenX, sheenY]);

  return {
    tiltStyle: prefersReducedMotion ? {} : {
      rotateX: springRotateX,
      rotateY: springRotateY,
      scale: springScale,
      perspective
    },
    sheenStyle: {
      sheenX: springSheenX,
      sheenY: springSheenY
    },
    handleMouseMove,
    handleMouseLeave
  };
}
