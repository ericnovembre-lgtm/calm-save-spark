import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { GoalPreviewCard } from './GoalPreviewCard';
import { useState, useRef, useEffect } from 'react';

interface PhoneMockup3DProps {
  goalData: {
    name: string;
    targetAmount: number;
    timeline: string;
    backgroundImage: string;
    progress: number;
  };
  isLoading?: boolean;
}

export const PhoneMockup3D = ({ goalData, isLoading }: PhoneMockup3DProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), {
    stiffness: 400,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), {
    stiffness: 400,
    damping: 30,
  });

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      x.set((e.clientX - centerX) / rect.width);
      y.set((e.clientY - centerY) / rect.height);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      setIsHovered(false);
      x.set(0);
      y.set(0);
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [x, y, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      id="phone-container"
      className="relative w-full max-w-sm mx-auto"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
        }}
        animate={prefersReducedMotion ? {} : {
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* Phone Frame */}
        <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] p-3 shadow-2xl">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-3xl z-10" />
          
          {/* Screen */}
          <div className="relative bg-background rounded-[2.5rem] overflow-hidden aspect-[9/19.5] backdrop-blur-xl">
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/20 to-transparent z-10 flex items-center justify-between px-8 pt-2">
              <span className="text-xs text-white/80">9:41</span>
              <div className="flex gap-1 items-center">
                <div className="w-4 h-3 border border-white/60 rounded-sm" />
                <div className="w-1 h-3 bg-white/60 rounded-full" />
              </div>
            </div>
            
            {/* Content */}
            <div className="h-full p-6 pt-16 pb-12 flex flex-col">
              <div className="text-xs font-semibold text-muted-foreground mb-4">
                Your Goal
              </div>
              
              <GoalPreviewCard 
                name={goalData.name}
                targetAmount={goalData.targetAmount}
                timeline={goalData.timeline}
                backgroundImage={goalData.backgroundImage}
                progress={goalData.progress}
                isLoading={isLoading}
              />
              
              <div className="mt-auto pt-6 space-y-3">
                <div className="h-12 bg-muted/30 rounded-xl backdrop-blur-sm" />
                <div className="h-12 bg-muted/20 rounded-xl backdrop-blur-sm" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Shadow */}
        <motion.div
          className="absolute inset-0 -z-10 blur-3xl opacity-30"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
          }}
          animate={prefersReducedMotion ? {} : {
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </div>
  );
};
