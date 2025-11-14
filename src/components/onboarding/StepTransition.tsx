import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ReactNode } from "react";

interface StepTransitionProps {
  children: ReactNode;
  stepKey: string | number;
  direction?: "forward" | "backward";
}

export const StepTransition = ({ 
  children, 
  stepKey,
  direction = "forward"
}: StepTransitionProps) => {
  const prefersReducedMotion = useReducedMotion();

  const variants = {
    enter: (direction: string) => ({
      x: prefersReducedMotion ? 0 : direction === "forward" ? 50 : -50,
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.98,
      filter: prefersReducedMotion ? "none" : "blur(4px)"
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)"
    },
    exit: (direction: string) => ({
      x: prefersReducedMotion ? 0 : direction === "forward" ? -50 : 50,
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.98,
      filter: prefersReducedMotion ? "none" : "blur(4px)"
    })
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          duration: prefersReducedMotion ? 0 : 0.4,
          ease: [0.22, 1, 0.36, 1], // Custom easing for smooth feel
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
