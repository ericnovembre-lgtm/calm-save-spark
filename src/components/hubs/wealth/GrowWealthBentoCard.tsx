import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode, MouseEvent, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { soundEffects } from '@/lib/sound-effects';

interface GrowWealthBentoCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  size?: 'sm' | 'md' | 'lg' | 'wide';
  index: number;
  badge?: string;
  stat?: string;
  showSparkline?: boolean;
}

/**
 * GrowWealthBentoCard - "Crystal" Glass Card
 * 
 * Premium features:
 * - More opaque background (0.5 vs 0.4)
 * - Increased border opacity (white/15)
 * - Sharper backdrop blur (28px)
 * - Faster shine animation (1.5s)
 * - Warm accent spotlight
 * - Optional background sparkline
 */
export const GrowWealthBentoCard = ({ 
  title, 
  description, 
  icon, 
  path, 
  size = 'sm',
  index,
  badge,
  stat,
  showSparkline = false,
}: GrowWealthBentoCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasPlayedHover, setHasPlayedHover] = useState(false);
  const [sparklineDrawn, setSparklineDrawn] = useState(false);
  
  // Mouse position for spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Normalized mouse position for 3D tilt
  const normalizedX = useMotionValue(0);
  const normalizedY = useMotionValue(0);
  
  // Spring-based rotations for smooth 3D tilt (±5°)
  const rotateX = useSpring(
    useTransform(normalizedY, [-0.5, 0.5], [5, -5]),
    { stiffness: 200, damping: 25 }
  );
  const rotateY = useSpring(
    useTransform(normalizedX, [-0.5, 0.5], [-5, 5]),
    { stiffness: 200, damping: 25 }
  );

  // Trigger sparkline draw on mount
  useEffect(() => {
    if (showSparkline) {
      const timer = setTimeout(() => setSparklineDrawn(true), 300 + index * 100);
      return () => clearTimeout(timer);
    }
  }, [showSparkline, index]);

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

  const handleMouseEnter = () => {
    if (!hasPlayedHover) {
      soundEffects.hover();
      setHasPlayedHover(true);
    }
  };

  const handleMouseLeave = () => {
    setHasPlayedHover(false);
    normalizedX.set(0);
    normalizedY.set(0);
  };

  const handleClick = () => {
    soundEffects.click();
  };

  // Warm accent spotlight (wealth tone)
  const spotlight = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, hsl(var(--accent) / 0.15), transparent 80%)`;

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

  // Generate sparkline path data (upward trend)
  const sparklinePath = "M0,45 Q20,40 40,35 T80,28 Q100,25 120,22 T160,15 Q180,12 200,10";

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
          className="relative h-full p-6 rounded-3xl overflow-hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:scale-[1.02] transition-transform"
          style={{
            background: 'hsl(var(--card) / 0.5)',  // More opaque (0.5 vs 0.4)
            backdropFilter: 'blur(28px)',  // Sharper blur
            WebkitBackdropFilter: 'blur(28px)',
            transformStyle: 'preserve-3d',
            rotateX: prefersReducedMotion ? 0 : rotateX,
            rotateY: prefersReducedMotion ? 0 : rotateY,
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
          {/* Crystal border - increased opacity */}
          <div className="absolute inset-0 rounded-3xl border border-white/15 pointer-events-none" />
          
          {/* Inner glow on edges */}
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 70px hsl(var(--accent) / 0.12)'
            }}
          />

          {/* Background sparkline (for key cards) */}
          {showSparkline && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 200 60"
              preserveAspectRatio="none"
            >
              <motion.path
                d={sparklinePath}
                fill="none"
                stroke="hsl(var(--accent) / 0.08)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: sparklineDrawn ? 1 : 0 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
          )}

          {/* Cursor spotlight effect (warm accent) */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: spotlight }}
          />

          {/* Sharp shine effect on hover - faster animation */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(105deg, transparent 30%, hsl(var(--accent) / 0.15) 50%, transparent 70%)',
                transform: 'translateX(-100%)',
                animation: 'crystalShine 1.5s ease-in-out infinite',
              }}
            />
          </div>

          {/* Badge */}
          {badge && (
            <div className="absolute top-4 right-4 z-20">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                badge === "Popular" 
                  ? "bg-primary/20 text-primary" 
                  : "bg-accent/20 text-accent"
              }`}>
                {badge}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col" style={{ transform: 'translateZ(20px)' }}>
            <div className="mb-4">
              {icon}
            </div>
            
            <h3 className={`font-display font-bold text-foreground mb-2 ${size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
              {title}
            </h3>
            
            <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
              {description}
            </p>

            {/* Stat display */}
            {stat && (
              <div className="mt-3 pt-3 border-t border-accent/10">
                <p className="text-xs text-accent font-medium">{stat}</p>
              </div>
            )}

            {/* Subtle arrow indicator */}
            <div className="mt-4 flex items-center gap-2 text-accent/60 group-hover:text-accent transition-colors duration-300">
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
        @keyframes crystalShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  );
};
