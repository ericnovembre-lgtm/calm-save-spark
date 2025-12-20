import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface DiamondSparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface AmbientOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: 'primary' | 'accent';
}

/**
 * PremiumBackground - "Exclusive Private Lounge"
 * 
 * Visual atmosphere:
 * - Deep gradient with primary/accent undertones
 * - Diamond sparkle particles (twinkling stars)
 * - Velvet texture overlay
 * - Ambient floating orbs
 * - Subtle spotlight from top-center
 */
export const PremiumBackground = () => {
  const prefersReducedMotion = useReducedMotion();

  // Generate diamond sparkle particles
  const sparkles = useMemo<DiamondSparkle[]>(() => 
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,  // 1.5-4.5px
      delay: Math.random() * 6,
      duration: 2 + Math.random() * 3,  // 2-5s twinkle cycle
    })),
    []
  );

  // Generate ambient orbs (larger, slower)
  const orbs = useMemo<AmbientOrb[]>(() => 
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: 15 + (i * 25) + (Math.random() * 10 - 5),
      y: 20 + (Math.random() * 60),
      size: 180 + Math.random() * 140,  // 180-320px
      delay: i * 2,
      duration: 18 + Math.random() * 8,
      color: i % 2 === 0 ? 'primary' : 'accent',
    })),
    []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Deep gradient base */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, hsl(var(--primary) / 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, hsl(var(--accent) / 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 20% 80%, hsl(var(--primary) / 0.06) 0%, transparent 50%),
            hsl(var(--background))
          `
        }}
      />

      {/* Spotlight from top-center */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
        style={{
          background: 'radial-gradient(ellipse at center top, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Velvet texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient floating orbs */}
      {!prefersReducedMotion && orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: orb.color === 'primary'
              ? 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)'
              : 'radial-gradient(circle, hsl(var(--accent) / 0.05) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Diamond sparkle particles */}
      {!prefersReducedMotion && sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          animate={{
            scale: [0.3, 1, 0.3],
            opacity: [0.2, 0.9, 0.2],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Diamond/star shape */}
          <svg
            viewBox="0 0 10 10"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 0 2px hsl(var(--primary) / 0.5))' }}
          >
            <path
              d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z"
              fill="hsl(var(--primary))"
              fillOpacity="0.8"
            />
          </svg>
        </motion.div>
      ))}

      {/* Gradient mesh accent lines */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="premiumLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="30%" x2="100%" y2="50%" stroke="url(#premiumLine)" strokeWidth="1" />
        <line x1="100%" y1="20%" x2="0" y2="70%" stroke="url(#premiumLine)" strokeWidth="1" />
      </svg>
    </div>
  );
};