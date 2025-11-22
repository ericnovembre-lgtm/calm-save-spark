import { Helmet } from "react-helmet";
import { Suspense, useEffect, useState } from "react";
import { WelcomeNavbar } from "@/components/welcome/WelcomeNavbar";
import { PriorityLoader } from "@/components/performance/PriorityLoader";
import { GenerativeHero } from "@/components/landing/generative/GenerativeHero";
import { BentoFeatures } from "@/components/landing/bento/BentoFeatures";
import { ROICalculator } from "@/components/landing/ROICalculator";
import { StickyCTA } from "@/components/landing/StickyCTA";
import { VideoTestimonials } from "@/components/landing/testimonials/VideoTestimonials";
import { LiveActivityFeed } from "@/components/landing/social/LiveActivityFeed";
import { SocialProofTicker } from "@/components/landing/advanced/SocialProofTicker";
import { FeatureHubs } from "@/components/landing/FeatureHubs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SolutionsShowcase } from "@/components/landing/SolutionsShowcase";
import { AIAgentsPreview } from "@/components/landing/AIAgentsPreview";
import { Stats } from "@/components/landing/Stats";
import { CTA } from "@/components/landing/CTA";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useWebVitals } from "@/hooks/useWebVitals";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BrandedProgressLoader, BrandedSkeletonCard } from "@/components/landing/BrandedLoader";
import { PerformanceBudgetMonitor } from "@/components/performance/PerformanceBudgetMonitor";
import { AccessibilityTestPanel } from "@/components/performance/AccessibilityTestPanel";
import { SkipToContent } from "@/components/accessibility/SkipToContent";

// Lazy load heavy components for better performance
import {
  LazyInteractiveDemo,
  LazyFAQ,
  LazyTestimonials,
  LazyPlatformOverview,
  LazyEffectsBundle,
} from "@/components/landing/LazyComponents";

// Advanced generative components
import {
  LazyAISavingsSimulator,
  LazyNeuralNetworkBackground,
  LazyMagneticCursor,
  LazyLiveSocialProofStream,
  LazyCoinParticleSystem,
  LazyInteractiveTimeline,
} from "@/components/landing/LazyComponentsAdvanced";

// Skeleton loaders
import { PremiumShowcaseSkeleton } from "@/components/landing/skeletons/PremiumShowcaseSkeleton";
import { TestimonialsSkeleton } from "@/components/landing/skeletons/TestimonialsSkeleton";
import { CalculatorSkeleton } from "@/components/landing/skeletons/CalculatorSkeleton";
import { InteractiveDemoSkeleton } from "@/components/landing/skeletons/InteractiveDemoSkeleton";
import { FAQSkeleton } from "@/components/landing/skeletons/FAQSkeleton";

export default function Landing() {
  useWebVitals(true);
  const prefersReducedMotion = useReducedMotion();
  const [loadEffects, setLoadEffects] = useState(false);

  // Defer effects loading until after critical content - only if motion not reduced
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const timer = setTimeout(() => {
      setLoadEffects(true);
    }, 2000); // Wait 2s after mount
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);
  
  return (
    <>
      <Helmet>
        <title>$ave+ | 63+ Tools to Save Smarter, Grow Wealth & Automate Finances</title>
        
        {/* Critical Resource Hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Preload Critical Assets */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Prefetch Below-Fold Components */}
        <link rel="prefetch" as="script" href="/src/components/landing/Stats.tsx" />
        <link rel="prefetch" as="script" href="/src/components/landing/Features.tsx" />
        <meta
          name="description"
          content="All-in-one financial platform with 63+ tools across 5 hubs: Money Management, Wealth Building, AI Insights, Lifestyle Solutions, and Premium Features. Join 250K+ users saving smarter."
        />
        <meta
          name="keywords"
          content="savings app, budget app, financial planning, AI financial advisor, wealth management, investment tracking, debt payoff, goal tracking, automated savings"
        />
        <meta property="og:title" content="$ave+ | Smart Financial Management Platform" />
        <meta
          property="og:description"
          content="Transform your finances with 63+ intelligent tools. Save smarter, grow wealth, and automate your financial future."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://saveplus.app" />
      </Helmet>

      {/* Skip to content link for keyboard navigation */}
      <SkipToContent />

      <div className="min-h-screen bg-background">
        {/* Performance Monitor (Dev Only) */}
        <PerformanceBudgetMonitor />
        
        {/* Accessibility Test Panel (Dev Only) */}
        <AccessibilityTestPanel />
        
        {/* Tier 1: Critical - Loads Immediately */}
        <WelcomeNavbar />
        <StickyCTA />
        
        {/* Main content with proper landmark and focus management */}
        <main id="main-content" tabIndex={-1} className="relative z-10 focus:outline-none">
          {/* Tier 1: Generative Hero Section */}
          <GenerativeHero />
          <SocialProofTicker />
          
          {/* Tier 2: High Priority - Load After Initial Paint */}
          <PriorityLoader priority="high">
            <BentoFeatures />
            <FeatureHubs />
            <HowItWorks />
          </PriorityLoader>
          
          {/* Tier 3: Medium Priority - Load on Scroll Approach */}
          <PriorityLoader priority="medium">
            <SolutionsShowcase />
            <AIAgentsPreview />
            
            <ErrorBoundary>
              <Suspense fallback={<BrandedProgressLoader message="Loading AI Simulator..." />}>
                <LazyAISavingsSimulator />
              </Suspense>
            </ErrorBoundary>
            
            <Stats />
          </PriorityLoader>
          
          {/* Tier 4: Low Priority - Load on Viewport Entry */}
          <PriorityLoader priority="low">            
            <ErrorBoundary>
              <Suspense fallback={<TestimonialsSkeleton />}>
                <LazyTestimonials />
              </Suspense>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8"><BrandedSkeletonCard /><BrandedSkeletonCard /><BrandedSkeletonCard /></div>}>
                <LazyPlatformOverview />
              </Suspense>
            </ErrorBoundary>
            
            <ROICalculator />
            
            <ErrorBoundary>
              <VideoTestimonials />
            </ErrorBoundary>
            
            <ErrorBoundary>
              <LiveActivityFeed />
            </ErrorBoundary>
            
            <ErrorBoundary>
              <Suspense fallback={<InteractiveDemoSkeleton />}>
                <LazyInteractiveDemo />
              </Suspense>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <Suspense fallback={<FAQSkeleton />}>
                <LazyFAQ />
              </Suspense>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <Suspense fallback={<BrandedProgressLoader message="Loading Timeline..." />}>
                <LazyInteractiveTimeline />
              </Suspense>
            </ErrorBoundary>
          </PriorityLoader>
          
          {/* Final CTA */}
          <CTA />
        </main>
        
        {/* Tier 5: Effects Bundle - Load Last After All Content, Only if Motion Allowed */}
        {loadEffects && !prefersReducedMotion && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <LazyEffectsBundle />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
    </>
  );
}
