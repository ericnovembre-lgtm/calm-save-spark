import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MagneticButtonProps extends ButtonProps {
  magneticRadius?: number;
  strength?: number;
}

export function MagneticButton({
  children,
  magneticRadius = 80,
  strength = 0.3,
  ...props
}: MagneticButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    if (distance < magneticRadius) {
      const pullStrength = (1 - distance / magneticRadius) * strength;
      x.set(distanceX * pullStrength);
      y.set(distanceY * pullStrength);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (prefersReducedMotion) {
    return <Button ref={buttonRef} {...props}>{children}</Button>;
  }

  return (
    <motion.div
      style={{
        x: springX,
        y: springY,
      }}
    >
      <Button
        ref={buttonRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}
