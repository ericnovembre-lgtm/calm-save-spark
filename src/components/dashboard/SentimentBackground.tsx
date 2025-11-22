import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SentimentBackgroundProps {
  netWorthChangePercent: number;
}

export function SentimentBackground({ netWorthChangePercent }: SentimentBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();

  const getSentimentGradient = (change: number): string => {
    if (change > 10) {
      // Positive growth: Green/Blue gradient
      return 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)';
    } else if (change < -5) {
      // Needs attention: Amber/Red gradient
      return 'linear-gradient(135deg, rgba(251, 146, 60, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)';
    }
    // Neutral: Purple/Accent (brand colors)
    return 'linear-gradient(135deg, hsl(var(--primary) / 0.03) 0%, hsl(var(--accent) / 0.03) 100%)';
  };

  return (
    <motion.div
      className="fixed inset-0 -z-10 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ 
        background: getSentimentGradient(netWorthChangePercent),
        opacity: 1
      }}
      transition={{ 
        duration: prefersReducedMotion ? 0 : 2, 
        ease: "easeInOut" 
      }}
    />
  );
}
