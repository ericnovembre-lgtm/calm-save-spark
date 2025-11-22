import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TypewriterTextFadeProps {
  phrases: string[];
  className?: string;
}

export const TypewriterTextFade = ({ phrases, className = "" }: TypewriterTextFadeProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    // Display phrase for 5 seconds
    const displayTimeout = setTimeout(() => {
      // Fade out
      setIsVisible(false);
      
      // After fade out, change phrase and fade in
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsVisible(true);
      }, 500); // Match fade-out duration
    }, 5000);

    return () => clearTimeout(displayTimeout);
  }, [currentPhraseIndex, phrases, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <span className={className}>{phrases[0]}</span>;
  }

  return (
    <span className={`inline-block min-w-[20ch] ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentPhraseIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        >
          {phrases[currentPhraseIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
