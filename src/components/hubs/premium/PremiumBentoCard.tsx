import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode, MouseEvent, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { soundEffects } from '@/lib/sound-effects';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

interface PremiumBentoCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  size?: 'sm' | 'md' | 'lg' | 'wide';
  index: number;
  badge?: string;
  isPremium?: boolean;
}

/**
 * PremiumBentoCard - "Velvet Glass" Card
 * 
 * Premium characteristics:
 * - Slightly translucent background (0.45)
 * - Primary color border (not accent)
 * - Gradient border shimmer on hover
 * - Diamond star-burst glow on icons
 * - Particle burst on hover
 */
export const PremiumBentoCard = ({ 
  title, 
  description, 
  icon, 
  path, 
  size = 'sm',
  index,
  badge,
  isPremium = false,
}: PremiumBentoCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasPlayedHover, setHasPlayedHover] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  
  // Mouse position for spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Normalized mouse position for 3D tilt
  const normalizedX = useMotionValue(0);
  const normalizedY = useMotionValue(0);
  
  // Spring-based rotations for smooth 3D tilt (±4°)
  const rotateX = useSpring(
    useTransform(normalizedY, [-0.5, 0.5], [4, -4]),
    { stiffness: 200, damping: 25 }
  );
  const rotateY = useSpring(
    useTransform(normalizedX, [-0.5, 0.5], [-4, 4]),
    { stiffness: 200, damping: 25 }
  );

  // Generate particle burst
  const spawnParticles = useCallback((centerX: number, centerY: number) => {
    if (prefersReducedMotion) return;
    
    const particleCount = 8;
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x: centerX,
      y: centerY,
      angle: (360 / particleCount) * i + (Math.random() * 30 - 15),
      distance: 50 + Math.random() * 40,
      size: 3 + Math.random() * 3,
      delay: Math.random() * 0.1,
    }));
    
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 700);
  }, [prefersReducedMotion]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
    
    if (!prefersReducedMotion) {
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      normalizedX.set(x);
      normalizedY.set(y);
    }
  };

  const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    
    if (!hasPlayedHover) {
      soundEffects.hover();
      setHasPlayedHover(true);
    }
    
    // Spawn particles at cursor position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spawnParticles(x, y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHasPlayedHover(false);
    normalizedX.set(0);
    normalizedY.set(0);
  };

  const handleClick = () => {
    soundEffects.click();
  };

  // Primary color spotlight (premium tone)
  const spotlight = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, hsl(var(--primary) / 0.12), transparent 80%)`;

  const sizeClasses = {
    sm: '',
    md: 'md:col-span-1 md:row-span-2',
    lg: 'md:col-span-2 md:row-span-2',
    wide: 'md:col-span-2 lg:col-span-3',
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95,
      filter: 'blur(10px)'
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: { 
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  return (
    <motion.div
      className={`relative group ${sizeClasses[size]}`}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      style={{ perspective: 1000 }}
    >
      <Link to={path} className="block h-full focus:outline-none" onClick={handleClick}>
        <motion.div
          ref={cardRef}
          className="relative h-full p-6 rounded-3xl overflow-hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:scale-[1.02] transition-transform"
          style={{
            background: 'hsl(var(--card) / 0.45)',
            backdropFilter: 'blur(26px)',
            WebkitBackdropFilter: 'blur(26px)',
            transformStyle: 'preserve-3d',
            rotateX: prefersReducedMotion ? 0 : rotateX,
            rotateY: prefersReducedMotion ? 0 : rotateY,
            boxShadow: isHovered 
              ? '0 0 50px hsl(var(--primary) / 0.15), 0 25px 50px -12px hsl(var(--background) / 0.5)'
              : '0 10px 40px -10px hsl(var(--background) / 0.3)',
            transition: 'box-shadow 0.3s ease',
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          whileHover={prefersReducedMotion ? {} : { 
            scale: 1.02, 
            y: -4,
            transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
          }}
        >
          {/* Gradient border with shimmer */}
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300"
            style={{
              padding: '1px',
              background: isHovered
                ? 'linear-gradient(135deg, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.2), hsl(var(--primary) / 0.4))'
                : 'linear-gradient(135deg, hsl(var(--primary) / 0.15), transparent, hsl(var(--primary) / 0.15))',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />
          
          {/* Inner glow on edges */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 60px hsl(var(--primary) / 0.1)'
            }}
          />

          {/* Cursor spotlight effect (primary) */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: spotlight }}
          />

          {/* Diamond shine effect on hover */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(105deg, transparent 30%, hsl(var(--primary) / 0.12) 50%, transparent 70%)',
                transform: 'translateX(-100%)',
                animation: 'premiumShine 2s ease-in-out infinite',
              }}
            />
          </div>

          {/* Particle burst container */}
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute pointer-events-none"
                style={{
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size,
                }}
                initial={{ 
                  scale: 0,
                  x: 0,
                  y: 0,
                  opacity: 1,
                }}
                animate={{ 
                  scale: [0, 1.2, 0.8],
                  x: Math.cos(particle.angle * Math.PI / 180) * particle.distance,
                  y: Math.sin(particle.angle * Math.PI / 180) * particle.distance,
                  opacity: [1, 0.8, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.6,
                  delay: particle.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <svg viewBox="0 0 10 10" className="w-full h-full">
                  <path
                    d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z"
                    fill="hsl(var(--primary))"
                    style={{ filter: 'drop-shadow(0 0 3px hsl(var(--primary) / 0.6))' }}
                  />
                </svg>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Premium badge */}
          {(badge || isPremium) && (
            <div className="absolute top-4 right-4 z-20">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/20">
                {badge || "Premium"}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col" style={{ transform: 'translateZ(20px)' }}>
            <div className="mb-4 relative">
              {/* Icon with star-burst glow */}
              <div 
                className="relative"
                style={{
                  filter: isHovered ? 'drop-shadow(0 0 12px hsl(var(--primary) / 0.4))' : 'none',
                  transition: 'filter 0.3s ease',
                }}
              >
                {icon}
              </div>
            </div>
            
            <h3 className={`font-display font-bold text-foreground mb-2 ${size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
              {title}
            </h3>
            
            <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
              {description}
            </p>

            {/* Subtle arrow indicator */}
            <div className="mt-4 flex items-center gap-2 text-primary/60 group-hover:text-primary transition-colors duration-300">
              <span className="text-xs font-medium">Explore</span>
              <motion.svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none"
                className="group-hover:translate-x-1 transition-transform duration-300"
              >
                <path 
                  d="M6 12L10 8L6 4" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </motion.svg>
            </div>
          </div>
        </motion.div>
      </Link>

      <style>{`
        @keyframes premiumShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  );
};