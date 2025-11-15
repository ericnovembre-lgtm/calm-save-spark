import { useRef, useCallback, useEffect } from 'react';
import { useSpring } from '@react-spring/web';

interface MagneticEffectOptions {
  strength?: number;
  radius?: number;
  scale?: number;
}

/**
 * Hook for magnetic cursor attraction effect
 * Creates smooth spring-based attraction to cursor within radius
 */
export function useMagneticEffect({
  strength = 0.3,
  radius = 60,
  scale = 1.05,
}: MagneticEffectOptions = {}) {
  const elementRef = useRef<HTMLElement>(null);
  
  const [springs, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    config: {
      tension: 300,
      friction: 20,
    },
  }));

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
    
    if (distance < radius) {
      const pullStrength = (1 - distance / radius) * strength;
      api.start({
        x: distanceX * pullStrength,
        y: distanceY * pullStrength,
        scale,
      });
    } else {
      api.start({
        x: 0,
        y: 0,
        scale: 1,
      });
    }
  }, [radius, strength, scale, api]);

  const handleMouseLeave = useCallback(() => {
    api.start({
      x: 0,
      y: 0,
      scale: 1,
    });
  }, [api]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    window.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return { elementRef, springs };
}
