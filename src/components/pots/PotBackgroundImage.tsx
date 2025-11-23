import { motion } from "framer-motion";

interface PotBackgroundImageProps {
  imageUrl?: string;
  progress: number; // 0-100
}

export const PotBackgroundImage = ({ imageUrl, progress }: PotBackgroundImageProps) => {
  if (!imageUrl) return null;
  
  // Image starts blurred (20px at 0%) and becomes clear (0px at 100%)
  const blurAmount = Math.max(0, 20 - (progress * 0.2));
  
  // Image starts faint (30% opacity at 0%) and becomes visible (100% at 100%)
  const opacity = Math.min(1, 0.3 + (progress * 0.007));
  
  return (
    <>
      {/* Background image layer */}
      <motion.div
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: `blur(${blurAmount}px)`,
          opacity: opacity
        }}
        animate={{ 
          filter: `blur(${blurAmount}px)`,
          opacity: opacity
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background/95 via-background/70 to-background/30" />
    </>
  );
};
