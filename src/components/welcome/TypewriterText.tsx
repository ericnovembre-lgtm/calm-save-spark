import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TypewriterTextProps {
  phrases: string[];
  className?: string;
}

export const TypewriterText = ({ phrases, className = "" }: TypewriterTextProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const controls = useAnimationControls();

  const currentPhrase = phrases[currentPhraseIndex];

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(currentPhrase);
      return;
    }

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (displayedText.length < currentPhrase.length) {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
        } else {
          // Finished typing, wait 5s then start fade-out transition
          setTimeout(() => setIsDeleting(true), 5000);
        }
      } else {
        // Fade-out complete, instantly switch to next phrase and fade-in
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? 30 : 80); // Faster transitions for smoother feel

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentPhrase, phrases, currentPhraseIndex, prefersReducedMotion]);

  // Pulse animation when typing is complete
  useEffect(() => {
    if (!prefersReducedMotion && displayedText === currentPhrase && !isDeleting) {
      controls.start({
        opacity: [1, 0.8, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      });
    } else {
      controls.stop();
    }
  }, [displayedText, currentPhrase, isDeleting, controls, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <span className={className}>{phrases[0]}</span>;
  }

  return (
    <span className={className}>
      <motion.span 
        animate={controls}
        initial={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        key={currentPhraseIndex} // Trigger fade on phrase change
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {displayedText}
        </motion.span>
      </motion.span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="inline-block w-0.5 h-[0.9em] bg-current ml-1 align-middle"
      />
    </span>
  );
};
