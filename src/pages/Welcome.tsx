import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { LottieHero } from "@/components/welcome/LottieHero";
import { MotionEmojiBadge } from "@/components/welcome/MotionEmojiBadge";
import { FeatureHighlights } from "@/components/welcome/FeatureHighlights";
import { QuickStartGrid } from "@/components/welcome/QuickStartGrid";

const Welcome = () => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch("/animations/saveplus-hero.json")
      .then(r => r.json())
      .then(data => setAnimationData(data))
      .catch(() => setAnimationData({}));
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-screen bg-background"
    >
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-2xl text-foreground">$ave+</h2>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <WelcomeHero />
          <div className="w-full max-w-md mx-auto lg:max-w-none">
            {animationData && (
              <LottieHero 
                animationData={animationData}
                autoplay
                loop
                className="w-full h-auto"
              />
            )}
          </div>
        </section>

        {/* Motion Emoji Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="Key features">
          <MotionEmojiBadge delay={0}>
            <span className="text-4xl" role="img" aria-label="Lightning">⚡</span>
          </MotionEmojiBadge>
          <MotionEmojiBadge delay={0.2}>
            <span className="text-4xl" role="img" aria-label="Target">🎯</span>
          </MotionEmojiBadge>
          <MotionEmojiBadge delay={0.4}>
            <span className="text-4xl" role="img" aria-label="Chart">📈</span>
          </MotionEmojiBadge>
          <MotionEmojiBadge delay={0.6}>
            <span className="text-4xl" role="img" aria-label="Shield">🛡️</span>
          </MotionEmojiBadge>
        </section>

        {/* Feature Highlights */}
        <section aria-label="Feature highlights">
          <h2 className="font-display font-bold text-3xl text-foreground mb-8">
            Your Financial Overview
          </h2>
          <FeatureHighlights />
        </section>

        {/* Quick Start Grid */}
        <section aria-label="Quick start actions">
          <h2 className="font-display font-bold text-3xl text-foreground mb-8">
            Get Started
          </h2>
          <QuickStartGrid />
        </section>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Powered by $ave+</p>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default Welcome;
