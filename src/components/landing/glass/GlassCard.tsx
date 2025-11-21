import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import React from 'react';

interface GlassCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
}

export function GlassCard({ 
  children, 
  className, 
  intensity = 'medium',
  ...props 
}: GlassCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const intensityClasses = {
    light: 'bg-background/40 backdrop-blur-sm',
    medium: 'bg-background/60 backdrop-blur-md',
    heavy: 'bg-background/80 backdrop-blur-lg'
  };

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { 
        y: -4,
        transition: { duration: 0.2 }
      }}
    >
      <Card
        className={cn(
          'relative overflow-hidden border-primary/10',
          intensityClasses[intensity],
          className
        )}
        {...props}
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
        
        {/* Subtle shimmer on hover */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </Card>
    </motion.div>
  );
}
