import { Helmet } from "react-helmet";
import { Suspense } from "react";
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
  
  return (
    <>
      <Helmet>
        <title>$ave+ | 63+ Tools to Save Smarter, Grow Wealth & Automate Finances</title>
        <link rel="preload" as="script" href="/src/components/landing/Hero.tsx" />
        <link rel="prefetch" as="script" href="/src/components/landing/LazyComponents.tsx" />
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
        <WelcomeNavbar />
        
        <main className="relative z-10">
          {/* Critical - Load immediately (above the fold) */}
          <Hero />
          <SocialProofTicker />
          
          {/* High priority - Load immediately */}
          <PriorityLoader priority="high">
            <FeatureHubs />
            <HowItWorks />
          </PriorityLoader>
          
          {/* Medium priority - Load when approaching viewport */}
          <PriorityLoader priority="medium">
            <ErrorBoundary>
              <Suspense fallback={<BrandedProgressLoader message="Loading AI Simulator..." />}>
                <LazyAISavingsSimulator />
              </Suspense>
            </ErrorBoundary>
            <Features />
            <SolutionsShowcase />
            <AIAgentsPreview />
          </PriorityLoader>
          
          {/* Low priority - Load when entering viewport */}
          <PriorityLoader priority="low">
            <ErrorBoundary>
              <Suspense fallback={<PremiumShowcaseSkeleton />}>
                <LazyPremiumShowcase />
              </Suspense>
            </ErrorBoundary>
            
            <Stats />
            
            <ErrorBoundary>
              <Suspense fallback={<TestimonialsSkeleton />}>
                <LazyUseCases />
                <LazyTestimonials />
              </Suspense>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8"><BrandedSkeletonCard /><BrandedSkeletonCard /><BrandedSkeletonCard /></div>}>
                <LazyPlatformOverview />
                <LazyFeatureComparison />
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
          
          <CTA />
        </main>
        
        <ErrorBoundary>
          <Suspense fallback={null}>
            <LazySaveplusCoachWidget />
          </Suspense>
        </ErrorBoundary>
        
        <SimpleBackground />
        
        {/* Advanced Effects - Load last, low priority */}
        <ErrorBoundary>
          <Suspense fallback={null}>
            <LazyFloatingParticles />
            <LazyNeuralNetworkBackground />
            <LazyMagneticCursor />
            <LazyLiveSocialProofStream />
            <LazyCoinParticleSystem />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
}
