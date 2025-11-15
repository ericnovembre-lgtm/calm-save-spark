import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface MagneticTierBadgeProps {
  tier: {
    name: string;
    color: string;
    icon: any;
  };
  isSelected?: boolean;
  onClick?: () => void;
  magneticRadius?: number;
}

export default function MagneticTierBadge({
  tier,
  isSelected = false,
  onClick,
  magneticRadius = 100,
}: MagneticTierBadgeProps) {
  const prefersReducedMotion = useReducedMotion();
  const { playClickSound } = useSoundEffects();
  const badgeRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !badgeRef.current) return;

    const rect = badgeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    if (distance < magneticRadius) {
      const strength = 1 - distance / magneticRadius;
      x.set(distanceX * strength * 0.3);
      y.set(distanceY * strength * 0.3);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleClick = () => {
    playClickSound();
    onClick?.();
  };

  const Icon = tier.icon;

  return (
    <motion.div
      ref={badgeRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      onClick={handleClick}
      style={{
        x: prefersReducedMotion ? 0 : springX,
        y: prefersReducedMotion ? 0 : springY,
      }}
      className="inline-block cursor-pointer"
    >
      <motion.div
        animate={{
          scale: isHovered && !prefersReducedMotion ? 1.1 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Badge
          variant={isSelected ? 'default' : 'outline'}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium
            transition-all duration-300
            ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
            ${isHovered ? 'shadow-lg' : 'shadow-sm'}
          `}
          style={{
            backgroundColor: isSelected ? tier.color : 'transparent',
            borderColor: tier.color,
          }}
        >
          <Icon className="w-4 h-4" />
          {tier.name}
        </Badge>
      </motion.div>
      
      {isHovered && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-30 -z-10"
          style={{ backgroundColor: tier.color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1.5 }}
          exit={{ scale: 0 }}
        />
      )}
    </motion.div>
  );
}
