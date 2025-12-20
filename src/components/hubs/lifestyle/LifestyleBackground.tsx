import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMemo } from 'react';

export const LifestyleBackground = () => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  
  // Parallax transforms for orbs - gentler than AI hub
  const orbY1 = useTransform(scrollY, [0, 600], [0, -25]);
  const orbY2 = useTransform(scrollY, [0, 600], [0, -40]);
  const orbY3 = useTransform(scrollY, [0, 600], [0, -15]);
  const orbY4 = useTransform(scrollY, [0, 600], [0, -30]);

  // Orbs with warmer, more organic feel than AI hub
  const orbs = [
    { 
      color: 'hsl(var(--accent) / 0.15)',  // Warm gold-beige (primary lifestyle color)
      size: 550, 
      position: { top: '-8%', left: '-8%' },
      duration: 25,  // Slower for "organic" feel
      delay: 0,
      parallaxY: orbY1,
    },
    { 
      color: 'hsl(var(--primary) / 0.10)', 
      size: 480, 
      position: { top: '45%', right: '-12%' },
      duration: 30,
      delay: 3,
      parallaxY: orbY2,
    },
    { 
      color: 'hsl(var(--accent) / 0.12)', 
      size: 400, 
      position: { bottom: '-10%', left: '35%' },
      duration: 28,
      delay: 5,
      parallaxY: orbY3,
    },
    { 
      color: 'hsl(var(--muted) / 0.1)', 
      size: 320, 
      position: { top: '25%', left: '55%' },
      duration: 22,
      delay: 2,
      parallaxY: orbY4,
    },
  ];

  // Generate floating particles - calm, slow upward drift
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 2.5 + 1.5,
      x: Math.random() * 100,
      duration: Math.random() * 25 + 45,  // Slower than AI hub
      delay: Math.random() * 20,
      opacity: Math.random() * 0.2 + 0.08,
    })),
    []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Dark base layer */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Animated gradient orbs with organic breathing motion */}
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            ...orb.position,
            filter: 'blur(70px)',
            y: prefersReducedMotion ? 0 : orb.parallaxY,
          }}
          animate={prefersReducedMotion ? {} : {
            // Organic breathing motion - primarily y-axis (different from AI hub's x-axis)
            y: [0, -20, 0, 15, 0],
            scale: [1, 1.05, 1, 0.98, 1],
            opacity: [0.5, 0.7, 0.5, 0.6, 0.5],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}

      {/* Floating particles layer - slow upward drift */}
      {!prefersReducedMotion && particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            bottom: '-5%',
            background: `radial-gradient(circle, hsl(var(--accent) / ${particle.opacity}), hsl(var(--primary) / ${particle.opacity * 0.5}))`,
            boxShadow: `0 0 ${particle.size * 3}px hsl(var(--accent) / ${particle.opacity * 0.4})`,
          }}
          animate={{
            y: [0, -window.innerHeight * 1.3],
            x: [0, Math.sin(particle.id * 0.7) * 25, Math.cos(particle.id * 0.5) * -15, 0],
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

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle organic grid pattern - softer than AI hub */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--foreground) / 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
};
