import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export const AIInsightsBackground = () => {
  const prefersReducedMotion = useReducedMotion();

  const orbs = [
    { 
      color: 'hsl(var(--primary) / 0.15)', 
      size: 600, 
      position: { top: '-10%', left: '-5%' },
      duration: 15,
      delay: 0
    },
    { 
      color: 'hsl(270 80% 60% / 0.12)', 
      size: 500, 
      position: { top: '40%', right: '-10%' },
      duration: 18,
      delay: 2
    },
    { 
      color: 'hsl(200 80% 50% / 0.1)', 
      size: 450, 
      position: { bottom: '-15%', left: '30%' },
      duration: 20,
      delay: 4
    },
    { 
      color: 'hsl(330 70% 50% / 0.08)', 
      size: 350, 
      position: { top: '20%', left: '50%' },
      duration: 12,
      delay: 1
    },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Dark base layer */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Animated gradient orbs */}
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
          }}
          animate={prefersReducedMotion ? {} : {
            x: [0, 50, -30, 0],
            y: [0, -40, 60, 0],
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
