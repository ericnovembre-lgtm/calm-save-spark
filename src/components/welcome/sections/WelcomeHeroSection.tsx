import { motion, useInView, MotionValue } from "framer-motion";
import { Suspense } from "react";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { LottieHero } from "@/components/welcome/LottieHero";
import LazyErrorBoundary from "@/components/performance/LazyErrorBoundary";
import { TrackedLazyComponent } from "@/components/performance/TrackedLazyComponent";
import { PriorityLoader } from "@/components/performance/PriorityLoader";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface WelcomeHeroSectionProps {
  heroRef: React.RefObject<HTMLDivElement>;
  heroInView: boolean;
  animationData: any;
  mousePosition: { x: number; y: number };
  parallaxY: MotionValue<number> | number;
  opacity: MotionValue<number> | number;
  scrollYProgress: MotionValue<number>;
}

export function WelcomeHeroSection({
  heroRef,
  heroInView,
  animationData,
  mousePosition,
  parallaxY,
  opacity,
  scrollYProgress
}: WelcomeHeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <PriorityLoader priority="critical" minHeight="600px">
      <motion.section 
        ref={heroRef}
        className="space-y-8 relative bg-background -mx-4 px-4 lg:-mx-20 lg:px-20 py-12 rounded-2xl border border-[color:var(--color-border)]"
        style={prefersReducedMotion ? { zIndex: 'var(--z-content-priority)' } as React.CSSProperties : { y: parallaxY, opacity: scrollYProgress.get() < 0.1 ? 1 : opacity, zIndex: 'var(--z-content-priority)' } as React.CSSProperties}
      >
        {/* Hero content - always visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: -50 }}
            animate={prefersReducedMotion ? false : (heroInView ? { opacity: 1, x: 0 } : {})}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <WelcomeHero />
          </motion.div>
          
          <motion.div 
            className="relative w-full max-w-md mx-auto lg:max-w-none"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={prefersReducedMotion ? false : (heroInView ? { opacity: 1, scale: 1 } : {})}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            style={prefersReducedMotion ? {} : {
              transform: `perspective(1000px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${-mousePosition.y * 0.5}deg)`
            }}
          >
            {/* Subtle accent glow - neutral only */}
            <div className="absolute inset-0 bg-[color:var(--color-accent)]/20 blur-3xl" />
            {animationData ? (
              <div className="relative">
                <TrackedLazyComponent componentName="LottieHero" minHeight="384px">
                  <LazyErrorBoundary componentName="LottieHero" fallbackHeight="384px">
                    <LottieHero 
                      animationData={animationData}
                      autoplay
                      loop
                      className="w-full h-auto drop-shadow-2xl"
                    />
                  </LazyErrorBoundary>
                </TrackedLazyComponent>
              </div>
            ) : (
              <div className="w-full aspect-square bg-muted/20 rounded-xl animate-pulse" />
            )}
          </motion.div>
        </div>
      </motion.section>
    </PriorityLoader>
  );
}
