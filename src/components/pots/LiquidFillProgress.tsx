import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getGradientStyle, GradientKey } from "@/lib/pot-gradients";

interface LiquidFillProgressProps {
  progress: number; // 0-100
  gradientKey: GradientKey | string;
}

export const LiquidFillProgress = ({ progress, gradientKey }: LiquidFillProgressProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      className="absolute inset-0 -z-10 origin-bottom"
      initial={{ scaleY: 0 }}
      animate={{ 
        scaleY: progress / 100,
        transition: { 
          duration: prefersReducedMotion ? 0 : 1.5, 
          ease: [0.22, 1, 0.36, 1] 
        }
      }}
      style={{
        background: getGradientStyle(gradientKey)
      }}
    >
      {/* Wave animation at liquid surface */}
      {!prefersReducedMotion && progress > 5 && (
        <svg 
          className="absolute top-0 left-0 w-full" 
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          style={{ height: '20px' }}
        >
          <motion.path
            d="M0,5 Q25,0 50,5 T100,5 V10 H0 Z"
            fill="rgba(255, 255, 255, 0.15)"
            animate={{ 
              d: [
                "M0,5 Q25,0 50,5 T100,5 V10 H0 Z",
                "M0,5 Q25,8 50,5 T100,5 V10 H0 Z",
                "M0,5 Q25,0 50,5 T100,5 V10 H0 Z"
              ]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
      )}
    </motion.div>
  );
};
