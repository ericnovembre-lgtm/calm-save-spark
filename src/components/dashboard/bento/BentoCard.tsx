/**
 * BentoCard - Reusable card wrapper with premium styling
 * Features: rounded-3xl corners, soft shadows, staggered animations
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  noPadding?: boolean;
}

export function BentoCard({ 
  children, 
  className, 
  delay = 0,
  noPadding = false 
}: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={cn(
        "rounded-3xl shadow-sm border border-border/50 bg-card",
        "hover:shadow-md transition-shadow duration-300",
        !noPadding && "p-6",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
