import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
}

export function LiquidCardMorph({ children, delay = 0 }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ scale: 0, borderRadius: "100%" }}
      animate={{ 
        scale: 1, 
        borderRadius: ["100%", "20%", "10%", "24px"],
      }}
      transition={{ 
        delay,
        duration: 1,
        ease: [0.34, 1.56, 0.64, 1]
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        scale: 1.03,
        rotateY: 3,
        rotateX: -3,
        z: 50,
        borderRadius: ["24px", "30%", "24px"],
        transition: { duration: 0.6, ease: "easeInOut" }
      }}
      className="perspective-1000 relative"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: 'linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: isHovered ? ['200% 0', '-200% 0'] : ['200% 0', '200% 0']
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
