import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, TrendingUp, Award, Sparkles } from "lucide-react";
import { TypewriterText } from "@/components/welcome/TypewriterText";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HolographicButton } from "./hero/HolographicButton";
import { Suspense, lazy } from "react";

const Financial3DUniverse = lazy(() => 
  import('./hero/Financial3DUniverse').then(m => ({ default: m.Financial3DUniverse }))
);
const AIPersonalizedHero = lazy(() => 
  import('./hero/AIPersonalizedHero').then(m => ({ default: m.AIPersonalizedHero }))
);
const LiveDashboardPreview = lazy(() => 
  import('./hero/LiveDashboardPreview').then(m => ({ default: m.LiveDashboardPreview }))
);

export const Hero = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-[90vh] flex items-center px-4 md:px-20 py-20">
      <div className="absolute inset-0 bg-background" />
      
      {/* 3D Financial Universe */}
      <Suspense fallback={null}>
        <Financial3DUniverse />
      </Suspense>
      
      {/* Animated gradient orb */}
      {!prefersReducedMotion && (
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
          className="space-y-8"
        >
          {/* AI Personalized Hero */}
          <Suspense fallback={null}>
            <AIPersonalizedHero />
          </Suspense>
          <h1 className="font-display font-bold text-5xl md:text-7xl xl:text-8xl text-foreground leading-tight">
            Get Rewarded For{" "}
            <span className="inline-block whitespace-nowrap min-w-[20ch]">
              <TypewriterText
                phrases={[
                  "Saving, Not Spending",
                  "Owning, Not Loaning",
                  "Growing, Not Owing",
                  "Wealth, Not Poverty"
                ]}
                className="text-accent"
              />
            </span>
            <br />
            <motion.span
              className="text-accent text-xl md:text-3xl xl:text-4xl italic inline-block"
              animate={!prefersReducedMotion ? {
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
          
          <p className="text-xl text-muted-foreground max-w-xl">
            Join 50,000+ users who save{" "}
            <motion.span
              className="font-bold text-accent inline-block"
              whileHover={!prefersReducedMotion ? { scale: 1.1 } : {}}
            >
              $450/month
            </motion.span>
            {" "}automatically with smart round-ups and AI-powered insights.
          </p>
          
          {/* 3-Step Process */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: CreditCard, text: 'Connect Bank Account', delay: 0.2 },
              { icon: TrendingUp, text: 'Auto Save', delay: 0.3 },
              { icon: Award, text: 'Earn Rewards', delay: 0.4 },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: step.delay, duration: 0.4 }}
                  whileHover={!prefersReducedMotion ? { scale: 1.05, y: -2 } : {}}
                  className="px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-sm font-semibold text-foreground flex items-center gap-2 cursor-default"
                >
                  <Icon className="w-4 h-4" />
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
            <Link to="/onboarding" className="inline-block">
              <HolographicButton className="px-8 py-4 text-lg">
                <span className="flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </span>
              </HolographicButton>
            </Link>
            <Link to="/auth" className="inline-block">
              <HolographicButton variant="outline" className="px-8 py-4 text-lg">
                <span className="flex items-center">
                  Explore AI Agents
                  <Sparkles className="ml-2 w-4 h-4" />
                </span>
              </HolographicButton>
            </Link>
          </motion.div>
          
          {/* Live Dashboard Preview */}
          <Suspense fallback={<div className="h-48 rounded-lg bg-muted/20 animate-pulse" />}>
            <LiveDashboardPreview />
          </Suspense>
          
          <p className="text-sm text-muted-foreground">
            ✓ Free forever plan • ✓ No credit card required • ✓ Cancel anytime
          </p>

          {/* Trust Indicators */}
          <motion.div 
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border/50"
          >
            {[
              { value: '50K+', label: 'Active Users' },
              { value: '4.9★', label: 'App Rating' },
              { value: '$2.1M+', label: 'Total Saved' },
              { value: '256-bit', label: 'Encryption' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-accent">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
