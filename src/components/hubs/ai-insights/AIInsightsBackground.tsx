import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMemo } from 'react';

export const AIInsightsBackground = () => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  
  // Parallax transforms for orbs
  const orbY1 = useTransform(scrollY, [0, 500], [0, -30]);
  const orbY2 = useTransform(scrollY, [0, 500], [0, -50]);
  const orbY3 = useTransform(scrollY, [0, 500], [0, -20]);
  const orbY4 = useTransform(scrollY, [0, 500], [0, -40]);

  const orbs = [
    { 
      color: 'hsl(var(--primary) / 0.15)', 
      size: 600, 
      position: { top: '-10%', left: '-5%' },
      duration: 18,
      delay: 0,
      parallaxY: orbY1,
    },
    { 
      color: 'hsl(var(--accent) / 0.12)', 
      size: 500, 
      position: { top: '40%', right: '-10%' },
      duration: 22,
      delay: 2,
      parallaxY: orbY2,
    },
    { 
      color: 'hsl(var(--primary) / 0.08)', 
      size: 450, 
      position: { bottom: '-15%', left: '30%' },
      duration: 25,
      delay: 4,
      parallaxY: orbY3,
    },
    { 
      color: 'hsl(var(--muted) / 0.1)', 
      size: 350, 
      position: { top: '20%', left: '50%' },
      duration: 15,
      delay: 1,
      parallaxY: orbY4,
    },
  ];

  // Generate floating particles - calm, slow drift
  const particles = useMemo(() => 
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: Math.random() * 2.5 + 1,
      x: Math.random() * 100,
      duration: Math.random() * 20 + 40,
      delay: Math.random() * 15,
      opacity: Math.random() * 0.25 + 0.1,
    })),
    []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Dark base layer */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Animated gradient orbs with parallax */}
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            ...orb.position,
            filter: 'blur(60px)',
            y: prefersReducedMotion ? 0 : orb.parallaxY,
          }}
          animate={prefersReducedMotion ? {} : {
            x: [0, 50, -30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}

      {/* Floating particles layer */}
      {!prefersReducedMotion && particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            bottom: '-5%',
            background: `radial-gradient(circle, hsl(var(--primary) / ${particle.opacity}), hsl(var(--accent) / ${particle.opacity * 0.5}))`,
            boxShadow: `0 0 ${particle.size * 2}px hsl(var(--primary) / ${particle.opacity * 0.5})`,
          }}
          animate={{
            y: [0, -window.innerHeight * 1.2],
            x: [0, Math.sin(particle.id) * 30, Math.cos(particle.id) * -20, 0],
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
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground) / 0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};
