import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
}

export function LiquidCardMorph({ children, delay = 0 }: Props) {
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
      whileHover={{
        scale: 1.05,
        borderRadius: ["24px", "30%", "24px"],
        transition: { duration: 0.6, ease: "easeInOut" }
      }}
    >
      {children}
    </motion.div>
  );
}
