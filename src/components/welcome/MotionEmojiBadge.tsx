import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionEmojiBadgeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const MotionEmojiBadge = ({ 
  children, 
  className = "", 
  delay = 0 
}: MotionEmojiBadgeProps) => {
  return (
    <motion.div
      data-testid="motion-icon"
      className={`bg-secondary rounded-lg p-6 flex items-center justify-center shadow-[var(--shadow-soft)] ${className}`}
      initial={{ scale: 1, y: 0 }}
      animate={{
        scale: [1, 1.02, 1],
        y: [0, -2, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      whileHover={{ scale: 1.04 }}
    >
      {children}
    </motion.div>
  );
};
