import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, TrendingUp, Award, Sparkles } from "lucide-react";
import { TypewriterTextFade } from "@/components/welcome/TypewriterTextFade";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { HolographicButton } from "./hero/HolographicButton";
import { Suspense, lazy, useState } from "react";

const Financial3DUniverse = lazy(() => 
  import('./hero/Financial3DUniverse').then(m => ({ default: m.Financial3DUniverse }))
);
const AIPersonalizedHero = lazy(() => 
  import('./hero/AIPersonalizedHero').then(m => ({ default: m.AIPersonalizedHero }))
);
const LiveDashboardPreview = lazy(() => 
  import('./hero/LiveDashboardPreview').then(m => ({ default: m.LiveDashboardPreview }))
);

import { ErrorBoundary } from "@/components/ErrorBoundary";

export const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [show3D, setShow3D] = useState(false);

  return (
    <section className="relative min-h-[90vh] flex items-center px-4 md:px-20 py-20">
      <div className="absolute inset-0 bg-background" />
      
      {/* 3D Financial Universe - Load on demand, hidden on mobile */}
      {show3D && !prefersReducedMotion && !isMobile && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Financial3DUniverse />
          </Suspense>
        </ErrorBoundary>
      )}
      
      {/* Animated gradient orb - only on desktop */}
      {!prefersReducedMotion && !isMobile && (
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      
      <div className="container mx-auto relative z-10 max-w-5xl">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 md:space-y-8"
        >
          {/* AI Personalized Hero - only on desktop */}
          {!isMobile && (
            <ErrorBoundary>
              <Suspense fallback={null}>
                <AIPersonalizedHero />
              </Suspense>
            </ErrorBoundary>
          )}
          
          <h1 className="font-display font-bold text-4xl md:text-6xl xl:text-8xl text-foreground leading-tight">
            {isMobile ? (
              // Simplified static text for mobile
              <>
                Get Rewarded For{" "}
                <span className="text-accent">Smart Saving</span>
              </>
            ) : (
              // Full animated text for desktop
              <>
                Get Rewarded For{" "}
                <span className="inline-block whitespace-nowrap min-w-[20ch]">
                  <TypewriterTextFade
                    phrases={[
                      "Saving, Not Spending",
                      "Owning, Not Loaning",
                      "Growing, Not Owing",
                      "Wealth, Not Poverty"
                    ]}
                    className="text-accent"
                  />
                </span>
              </>
            )}
            <br />
            <motion.span
              className="text-accent text-lg md:text-2xl xl:text-4xl italic inline-block"
              animate={!prefersReducedMotion && !isMobile ? {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              } : {}}
              transition={{ duration: 5, repeat: Infinity }}
              style={{
                background: 'linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)), hsl(var(--accent)))',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              More Money, Less Problems with $ave+
            </motion.span>
          </h1>
          
          <p className="text-base md:text-xl text-muted-foreground max-w-xl">
            {isMobile ? (
              "Join 50,000+ users saving $450/month automatically."
            ) : (
              <>
                Join 50,000+ users who save{" "}
                <motion.span
                  className="font-bold text-accent inline-block"
                  whileHover={!prefersReducedMotion ? { scale: 1.1 } : {}}
                >
                  $450/month
                </motion.span>
                {" "}automatically with smart round-ups and AI-powered insights.
              </>
            )}
          </p>
          
          {/* 3-Step Process - simplified on mobile */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: CreditCard, text: isMobile ? 'Connect' : 'Connect Bank Account', delay: 0.2 },
              { icon: TrendingUp, text: 'Auto Save', delay: 0.3 },
              { icon: Award, text: isMobile ? 'Rewards' : 'Earn Rewards', delay: 0.4 },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: step.delay, duration: 0.4 }}
                  whileHover={!prefersReducedMotion && !isMobile ? { scale: 1.05, y: -2 } : {}}
                  className="px-3 md:px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-xs md:text-sm font-semibold text-foreground flex items-center gap-2 cursor-default"
                >
                  <Icon className="w-3 h-3 md:w-4 md:h-4" />
                  {step.text}
                </motion.div>
              );
            })}
          </div>
          
          {/* CTAs with Holographic Buttons */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/onboarding" className="inline-block w-full sm:w-auto">
              <HolographicButton className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg w-full">
                <span className="flex items-center justify-center">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                </span>
              </HolographicButton>
            </Link>
            {!isMobile && !show3D && !prefersReducedMotion && (
              <button 
                onClick={() => setShow3D(true)}
                className="inline-block"
              >
                <HolographicButton variant="outline" className="px-8 py-4 text-lg">
                  <span className="flex items-center">
                    View 3D Experience
                    <Sparkles className="ml-2 w-4 h-4" />
                  </span>
                </HolographicButton>
              </button>
            )}
            {!isMobile && show3D && (
              <Link to="/auth" className="inline-block">
                <HolographicButton variant="outline" className="px-8 py-4 text-lg">
                  <span className="flex items-center">
                    Explore AI Agents
                    <Sparkles className="ml-2 w-4 h-4" />
                  </span>
                </HolographicButton>
              </Link>
            )}
          </motion.div>
          
          {/* Live Dashboard Preview - only on desktop */}
          {!isMobile && (
            <ErrorBoundary>
              <Suspense fallback={<div className="h-48 rounded-lg bg-muted/20 animate-pulse" />}>
                <LiveDashboardPreview />
              </Suspense>
            </ErrorBoundary>
          )}
          
          <p className="text-xs md:text-sm text-muted-foreground">
            ✓ Free forever plan • ✓ No credit card required • ✓ Cancel anytime
          </p>

          {/* Trust Indicators */}
          <motion.div 
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-6 md:pt-8 border-t border-border/50"
          >
            {[
              { value: '50K+', label: 'Active Users' },
              { value: '4.9★', label: 'App Rating' },
              { value: '$2.1M+', label: 'Total Saved' },
              { value: '256-bit', label: 'Encryption' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-xl md:text-2xl font-bold text-accent">{item.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
