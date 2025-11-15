import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export const SimpleBackground = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Animated gradient background */}
      {!prefersReducedMotion ? (
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, hsl(var(--accent) / 0.08) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, hsl(var(--accent) / 0.08) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 80%, hsl(var(--accent) / 0.08) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, hsl(var(--accent) / 0.08) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ) : (
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 20% 50%, hsl(var(--accent) / 0.08) 0%, transparent 50%)",
          }}
        />
      )}
      
      {/* Subtle grain texture */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-soft-light">
        <div
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />
      </div>
    </div>
  );
};
