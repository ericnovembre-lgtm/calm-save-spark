import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HUDOverlayProps {
  children: ReactNode;
  className?: string;
}

export function HUDOverlay({ children, className = '' }: HUDOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative ${className}`}
    >
      {/* Corner brackets */}
      <motion.div
        className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      />
      <motion.div
        className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-magenta-500"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-magenta-500"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      />

      {/* Content with backdrop blur */}
      <div className="backdrop-blur-xl bg-black/40 border border-white/10 p-6 rounded-lg">
        {children}
      </div>

      {/* Pulse indicator */}
      <motion.div
        className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-500 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}
