import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from 'framer-motion';

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const CardComponent = prefersReducedMotion ? Card : motion(Card);

  return (
    <CardComponent
      className="w-full max-w-md p-8 space-y-6 bg-card border-border shadow-lg"
      {...(!prefersReducedMotion && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      })}
    >
      {children}
    </CardComponent>
  );
}
