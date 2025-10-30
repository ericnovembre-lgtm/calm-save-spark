import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Zap, TrendingUp, Shield, Gift, Bot, Lock } from "lucide-react";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { LottieHero } from "@/components/welcome/LottieHero";
import { FeatureCarousel, Feature } from "@/components/welcome/FeatureCarousel";
import { FeatureDetailModal } from "@/components/welcome/FeatureDetailModal";
import { StatCard } from "@/components/welcome/StatCard";
import { SearchBarHinted } from "@/components/welcome/SearchBarHinted";
import { SecureOnboardingCTA } from "@/components/welcome/SecureOnboardingCTA";

const features: Feature[] = [
  {
    id: "smart-pots",
    icon: <Target className="w-6 h-6" />,
    title: "Smart Pots",
    description: "Organize savings into custom goal-based accounts",
    details: "Create dedicated savings pots for each financial goal. Set target amounts, deadlines, and watch your progress in real-time with automated tracking and insights."
  },
  {
    id: "automated-savings",
    icon: <Zap className="w-6 h-6" />,
    title: "Automated Savings",
    description: "Set it and forget it with intelligent automation",
    details: "Let AI analyze your spending patterns and automatically save the perfect amount. Round-ups, scheduled transfers, and smart rules work 24/7 to build your wealth."
  },
  {
    id: "ave-plus-card",
    icon: <Shield className="w-6 h-6" />,
    title: "$ave+ Card",
    description: "Earn while you spend with cashback rewards",
    details: "Premium debit card with up to 5% cashback on everyday purchases. Every transaction automatically rounds up and saves the change to your goals."
  },
  {
    id: "financial-insights",
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Financial Insights",
    description: "AI-powered analytics for smarter decisions",
    details: "Get personalized recommendations based on your spending habits, income patterns, and financial goals. Predictive analytics help you plan ahead and avoid surprises."
  },
  {
    id: "rewards-program",
    icon: <Gift className="w-6 h-6" />,
    title: "Rewards Program",
    description: "Earn points for healthy financial habits",
    details: "Build your wealth while earning rewards. Complete savings challenges, maintain streaks, and hit milestones to unlock bonus interest rates and exclusive perks."
  },
  {
    id: "ai-coach",
    icon: <Bot className="w-6 h-6" />,
    title: "AI Coach",
    description: "24/7 financial guidance and support",
    details: "Your personal AI financial advisor answers questions, provides insights, and helps optimize your savings strategy. Natural language conversations make finance simple."
  },
  {
    id: "bank-security",
    icon: <Lock className="w-6 h-6" />,
    title: "Bank-Level Security",
    description: "Military-grade encryption keeps your money safe",
    details: "FDIC insured up to $250,000. 256-bit encryption, two-factor authentication, and biometric security. Your data and funds are protected by the highest industry standards."
  }
];

const stats = [
  { label: "APY Rate", value: "4.25%" },
  { label: "Happy Users", value: "50K+" },
  { label: "Saved Together", value: "$2.1M+" },
  { label: "Uptime", value: "99.9%" }
];

const Welcome = () => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch("/animations/saveplus-hero.json")
      .then(r => r.json())
      .then(data => setAnimationData(data))
      .catch(() => setAnimationData({}));
  }, []);

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFeature(null), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-screen bg-background"
    >
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-2xl text-foreground">$ave+</h2>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-20">
        {/* Hero Section */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
          </div>
          
          <div className="mt-8">
            <SearchBarHinted />
          </div>
        </section>

        {/* Mission Control Features */}
        <section aria-label="Features">
          <h2 className="font-display font-bold text-3xl text-foreground mb-8">
            Mission Control
          </h2>
          <FeatureCarousel features={features} onFeatureClick={handleFeatureClick} />
        </section>

        {/* Stats Section */}
        <section aria-label="Statistics">
          <h2 className="font-display font-bold text-3xl text-foreground mb-8">
            Why Choose $ave+?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                delay={index * 0.1}
              />
            ))}
          </div>
        </section>

        {/* Secure Onboarding CTA */}
        <section aria-label="Get started">
          <SecureOnboardingCTA />
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

      <FeatureDetailModal
        feature={selectedFeature}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </motion.div>
  );
};

export default Welcome;
