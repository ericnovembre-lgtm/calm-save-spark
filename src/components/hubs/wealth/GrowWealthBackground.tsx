import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMemo } from 'react';

/**
 * GrowWealthBackground - "Premium Digital Vault" Atmosphere
 * 
 * Visual elements:
 * - Rising light streams (symbolizing growth and accumulation)
 * - Gold-dust particles drifting upward (against gravity)
 * - Hexagonal mesh overlay (fintech structure)
 * - Parallax gradient orbs for depth
 */
export const GrowWealthBackground = () => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  
  // Parallax transforms for orbs
  const orbY1 = useTransform(scrollY, [0, 600], [0, -30]);
  const orbY2 = useTransform(scrollY, [0, 600], [0, -45]);
  const orbY3 = useTransform(scrollY, [0, 600], [0, -20]);
  const orbY4 = useTransform(scrollY, [0, 600], [0, -35]);

  // Warm, structured orbs for vault feel
  const orbs = [
    { 
      color: 'hsl(var(--accent) / 0.18)',
      size: 520, 
      position: { top: '-10%', left: '-10%' },
      duration: 22,
      delay: 0,
      parallaxY: orbY1,
    },
    { 
      color: 'hsl(var(--primary) / 0.12)', 
      size: 450, 
      position: { top: '50%', right: '-15%' },
      duration: 26,
      delay: 2,
      parallaxY: orbY2,
    },
    { 
      color: 'hsl(var(--accent) / 0.14)', 
      size: 380, 
      position: { bottom: '-8%', left: '40%' },
      duration: 24,
      delay: 4,
      parallaxY: orbY3,
    },
    { 
      color: 'hsl(var(--muted) / 0.08)', 
      size: 300, 
      position: { top: '20%', left: '60%' },
      duration: 20,
      delay: 1,
      parallaxY: orbY4,
    },
  ];

  // Rising light streams - vertical gradient lines moving upward
  const lightStreams = useMemo(() => 
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 5 + (i * 10),  // Evenly distributed
      width: Math.random() * 2 + 1,  // 1-3px width
      opacity: Math.random() * 0.12 + 0.05,  // 0.05-0.17
      duration: 12 + Math.random() * 8,  // 12-20s
      delay: i * 1.2,
    })),
    []
  );

  // Gold-dust particles drifting upward
  const goldDustParticles = useMemo(() => 
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 2,  // 2-5px
      x: Math.random() * 100,
      duration: Math.random() * 20 + 35,  // 35-55s (slow, luxurious)
      delay: Math.random() * 15,
      opacity: Math.random() * 0.25 + 0.15,  // 0.15-0.40
    })),
    []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Dark base layer */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Animated gradient orbs with breathing motion */}
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            ...orb.position,
            filter: 'blur(80px)',
            y: prefersReducedMotion ? 0 : orb.parallaxY,
          }}
          animate={prefersReducedMotion ? {} : {
            y: [0, -15, 0, 10, 0],
            scale: [1, 1.04, 1, 0.97, 1],
            opacity: [0.6, 0.8, 0.6, 0.7, 0.6],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}

      {/* Rising Light Streams - vertical gradients moving upward */}
      {!prefersReducedMotion && lightStreams.map((stream) => (
        <motion.div
          key={`stream-${stream.id}`}
          className="absolute"
          style={{
            left: `${stream.x}%`,
            width: stream.width,
            height: '30vh',
            background: `linear-gradient(to top, transparent, hsl(var(--accent) / ${stream.opacity}), transparent)`,
            bottom: '-30vh',
          }}
          animate={{
            y: [0, -window.innerHeight * 1.5],
            opacity: [0, stream.opacity * 2, stream.opacity * 2, 0],
          }}
          transition={{
            duration: stream.duration,
            repeat: Infinity,
            delay: stream.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Gold-dust particles drifting upward */}
      {!prefersReducedMotion && goldDustParticles.map((particle) => (
        <motion.div
          key={`gold-${particle.id}`}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            bottom: '-5%',
            background: `radial-gradient(circle, hsl(var(--accent) / ${particle.opacity}), hsl(var(--accent) / ${particle.opacity * 0.3}))`,
            boxShadow: `0 0 ${particle.size * 6}px hsl(var(--accent) / ${particle.opacity * 0.5})`,
          }}
          animate={{
            y: [0, -window.innerHeight * 1.4],
            x: [0, Math.sin(particle.id * 0.8) * 30, Math.cos(particle.id * 0.6) * -20, 0],
            opacity: [0, particle.opacity, particle.opacity, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Hexagonal mesh overlay - fintech structure */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52' viewBox='0 0 60 52'%3E%3Cpath d='M30 0 L60 15 L60 37 L30 52 L0 37 L0 15 Z' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 52px',
        }}
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.010]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle grid pattern - reinforces structure */}
      <div 
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
};
