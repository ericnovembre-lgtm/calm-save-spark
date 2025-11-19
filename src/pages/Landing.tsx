import { Helmet } from "react-helmet";
import { WelcomeNavbar } from "@/components/welcome/WelcomeNavbar";
import { SaveplusCoachWidget } from "@/components/coach/SaveplusCoachWidget";
import { Hero } from "@/components/landing/Hero";
import { SocialProofTicker } from "@/components/landing/advanced/SocialProofTicker";
import { FeatureHubs } from "@/components/landing/FeatureHubs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { SolutionsShowcase } from "@/components/landing/SolutionsShowcase";
import { AIAgentsPreview } from "@/components/landing/AIAgentsPreview";
import { PremiumShowcase } from "@/components/landing/PremiumShowcase";
import { Stats } from "@/components/landing/Stats";
import { UseCases } from "@/components/landing/UseCases";
import { Testimonials } from "@/components/landing/advanced/Testimonials";
import { PlatformOverview } from "@/components/landing/PlatformOverview";
import { FeatureComparison } from "@/components/landing/FeatureComparison";
import { Integrations } from "@/components/landing/Integrations";
import { Calculator } from "@/components/landing/Calculator";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { SimpleBackground } from "@/components/landing/SimpleBackground";
import { FloatingParticles } from "@/components/landing/advanced/FloatingParticles";

export default function Landing() {
  return (
    <>
      <Helmet>
        <title>$ave+ | 63+ Tools to Save Smarter, Grow Wealth & Automate Finances</title>
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
          <Hero />
          <SocialProofTicker />
          <FeatureHubs />
          <HowItWorks />
          <Features />
          <SolutionsShowcase />
          <AIAgentsPreview />
          <PremiumShowcase />
          <Stats />
          <UseCases />
          <Testimonials />
          <PlatformOverview />
          <FeatureComparison />
          <Integrations />
          <Calculator />
          <InteractiveDemo />
          <FAQ />
          <CTA />
        </main>
        
        <SaveplusCoachWidget />
        <SimpleBackground />
        <FloatingParticles />
      </div>
    </>
  );
}
