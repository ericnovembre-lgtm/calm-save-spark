import { Helmet } from "react-helmet";
import { Suspense, useEffect, useState } from "react";
import { WelcomeNavbar } from "@/components/welcome/WelcomeNavbar";
import { PriorityLoader } from "@/components/performance/PriorityLoader";
import { Hero } from "@/components/landing/Hero";
import { SocialProofTicker } from "@/components/landing/advanced/SocialProofTicker";
import { FeatureHubs } from "@/components/landing/FeatureHubs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { SolutionsShowcase } from "@/components/landing/SolutionsShowcase";
import { AIAgentsPreview } from "@/components/landing/AIAgentsPreview";
import { Stats } from "@/components/landing/Stats";
import { CTA } from "@/components/landing/CTA";
import { SimpleBackground } from "@/components/landing/SimpleBackground";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useWebVitals } from "@/hooks/useWebVitals";
import { BrandedProgressLoader, BrandedSkeletonCard } from "@/components/landing/BrandedLoader";
import { PerformanceBudgetMonitor } from "@/components/performance/PerformanceBudgetMonitor";

// Lazy load heavy components for better performance
import {
  LazyPremiumShowcase,
  LazyUseCases,
  LazyTestimonials,
  LazyPlatformOverview,
  LazyFeatureComparison,
  LazyIntegrations,
  LazyCalculator,
  LazyInteractiveDemo,
  LazyFAQ,
  LazySaveplusCoachWidget,
  LazyFloatingParticles,
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
import { FeatureComparisonSkeleton } from "@/components/landing/skeletons/FeatureComparisonSkeleton";
import { IntegrationsSkeleton } from "@/components/landing/skeletons/IntegrationsSkeleton";

export default function Landing() {
  useWebVitals(true);
  const [loadEffects, setLoadEffects] = useState(false);

  // Defer effects loading until after critical content
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadEffects(true);
    }, 2000); // Wait 2s after mount
    return () => clearTimeout(timer);
  }, []);
  
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

      <div className="min-h-screen bg-background">
        {/* Performance Monitor (Dev Only) */}
        <PerformanceBudgetMonitor />
        
        {/* Tier 1: Critical - Loads Immediately */}
        <WelcomeNavbar />
        
        <main className="relative z-10">
          {/* Tier 1: Critical Above-the-Fold Content */}
          <Hero />
          <SocialProofTicker />
          
          {/* Tier 2: High Priority - Load After Initial Paint */}
          <PriorityLoader priority="high">
            <FeatureHubs />
            <HowItWorks />
            <Features />
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
              <Suspense fallback={<PremiumShowcaseSkeleton />}>
                <LazyPremiumShowcase />
              </Suspense>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <Suspense fallback={<TestimonialsSkeleton />}>
                <LazyUseCases />
                <LazyTestimonials />
              </Suspense>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8"><BrandedSkeletonCard /><BrandedSkeletonCard /><BrandedSkeletonCard /></div>}>
                <LazyPlatformOverview />
              </Suspense>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <Suspense fallback={<FeatureComparisonSkeleton />}>
                <LazyFeatureComparison />
              </Suspense>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <Suspense fallback={<IntegrationsSkeleton />}>
                <LazyIntegrations />
              </Suspense>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <Suspense fallback={<CalculatorSkeleton />}>
                <LazyCalculator />
              </Suspense>
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
        
        {/* Coach Widget - Independent Load */}
        <ErrorBoundary>
          <Suspense fallback={null}>
            <LazySaveplusCoachWidget />
          </Suspense>
        </ErrorBoundary>
        
        <SimpleBackground />
        
        {/* Tier 5: Effects - Load Last After All Content */}
        {loadEffects && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <LazyFloatingParticles />
              <LazyNeuralNetworkBackground />
              <LazyMagneticCursor />
              <LazyLiveSocialProofStream />
              <LazyCoinParticleSystem />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
    </>
  );
}
