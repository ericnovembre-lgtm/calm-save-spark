import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StickyCTA = () => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  
  // Show CTA after scrolling past hero (800px)
  const opacity = useTransform(scrollY, [0, 800, 900], [0, 0, 1]);
  const y = useTransform(scrollY, [0, 800, 900], [-50, -50, 0]);

  return (
    <motion.div
      style={prefersReducedMotion ? {} : { opacity, y }}
      className="fixed top-20 right-8 z-50 hidden lg:block"
    >
      <Link to="/onboarding">
        <motion.button
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          className="px-6 py-3 rounded-full bg-accent hover:bg-accent/90 text-white font-semibold text-sm shadow-lg shadow-accent/30 backdrop-blur-xl flex items-center gap-2 transition-colors"
        >
          Get Started Free
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </Link>
    </motion.div>
  );
};
