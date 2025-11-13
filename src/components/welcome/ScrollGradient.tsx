import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export const ScrollGradient = () => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Transform scroll progress to color transitions
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [
      "hsla(var(--background), 1)",
      "hsla(var(--background), 0.98)",
      "hsla(var(--background), 0.95)",
      "hsla(var(--background), 0.95)",
      "hsla(var(--background), 0.98)",
      "hsla(var(--background), 1)",
    ]
  );

  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0, 0.03, 0.05, 0.03, 0]
  );

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <>
      {/* Base scroll-reactive background */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{ backgroundColor, zIndex: 0 }}
        aria-hidden="true"
      />
      
      {/* Accent overlay */}
      <motion.div
        className="fixed inset-0 pointer-events-none bg-accent"
        style={{ opacity: overlayOpacity, zIndex: 1 }}
        aria-hidden="true"
      />
    </>
  );
};
