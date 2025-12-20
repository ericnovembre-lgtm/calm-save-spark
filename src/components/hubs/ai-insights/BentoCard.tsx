import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode, MouseEvent } from 'react';
import { Link } from 'react-router-dom';

interface BentoCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  size?: 'sm' | 'md' | 'lg' | 'wide';
  index: number;
}

export const BentoCard = ({ 
  title, 
  description, 
  icon, 
  path, 
  size = 'sm',
  index 
}: BentoCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const spotlight = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, hsl(var(--primary) / 0.15), transparent 80%)`;

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
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  return (
    <motion.div
      className={`relative group ${sizeClasses[size]}`}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <Link to={path} className="block h-full">
        <motion.div
          className="relative h-full p-6 rounded-3xl overflow-hidden cursor-pointer"
          style={{
            background: 'hsl(var(--card) / 0.4)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
          onMouseMove={handleMouseMove}
          whileHover={prefersReducedMotion ? {} : { 
            scale: 1.02, 
            y: -4,
            transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
          }}
        >
          {/* Glassmorphic border */}
          <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />
          
          {/* Inner glow on edges */}
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 60px hsl(var(--primary) / 0.1)'
            }}
          />

          {/* Cursor spotlight effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: spotlight }}
          />

          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, hsl(var(--primary) / 0.08) 50%, transparent 60%)',
                transform: 'translateX(-100%)',
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col">
            <div className="mb-4">
              {icon}
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
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  );
};
