import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/welcome/advanced/MagneticButton";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import confetti from 'canvas-confetti';

export const CTA = () => {
  const prefersReducedMotion = useReducedMotion();

  const handleCTAClick = () => {
    if (!prefersReducedMotion) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d6c8a2', '#faf8f2', '#0a0a0a'],
      });
    }
  };

  return (
    <section className="py-20 px-4 md:px-20">
      <div className="container mx-auto max-w-3xl text-center">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Glow effect */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 bg-accent/10 rounded-3xl blur-3xl -z-10"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          <div className="space-y-8 relative z-10">
            <motion.h2
              className="text-4xl md:text-6xl font-bold text-foreground"
              animate={!prefersReducedMotion ? {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              } : {}}
              transition={{ duration: 5, repeat: Infinity }}
              style={{
                background: 'linear-gradient(90deg, hsl(var(--foreground)), hsl(var(--accent)), hsl(var(--foreground)))',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Ready to Start Saving?
            </motion.h2>

            <p className="text-xl text-muted-foreground">
              Join thousands of smart savers. No credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/onboarding" className="inline-block" onClick={handleCTAClick}>
                <MagneticButton variant="default" className="group px-8 py-4 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </MagneticButton>
              </Link>
              
              <Link to="/pricing" className="inline-block">
                <MagneticButton variant="outline" className="px-8 py-4 text-lg">
                  View Pricing
                </MagneticButton>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground mt-6">
              ✓ Free forever plan available • ✓ No credit card required • ✓ Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
