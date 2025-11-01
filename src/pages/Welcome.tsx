import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Target, Zap, TrendingUp, Shield, Gift, Bot, Lock, Sparkles } from "lucide-react";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { LottieHero } from "@/components/welcome/LottieHero";
import { FeatureCarousel, Feature } from "@/components/welcome/FeatureCarousel";
import { FeatureDetailModal } from "@/components/welcome/FeatureDetailModal";
import { StatCard } from "@/components/welcome/StatCard";
import { SearchBarHinted } from "@/components/search/SearchBarHinted";
import { SecureOnboardingCTA } from "@/components/welcome/SecureOnboardingCTA";
import { SaveplusCoachWidget } from "@/components/coach/SaveplusCoachWidget";
import { SaveplusUIAssistantFAB } from "@/components/assistant/SaveplusUIAssistantFAB";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackPageView } from "@/lib/analytics";

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const heroInView = useInView(heroRef, { once: false, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: false, amount: 0.2 });
  const statsInView = useInView(statsRef, { once: false, amount: 0.3 });
  
  // Disable parallax if user prefers reduced motion
  const parallaxY = prefersReducedMotion 
    ? 0 
    : useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = prefersReducedMotion
    ? 1
    : useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);

  // Track page view on mount
  useEffect(() => {
    trackPageView('Welcome');
  }, []);

  useEffect(() => {
    fetch("/animations/saveplus-hero.json")
      .then(r => r.json())
      .then(data => setAnimationData(data))
      .catch(() => setAnimationData({}));
  }, []);

  useEffect(() => {
    // Disable mouse tracking if user prefers reduced motion
    if (prefersReducedMotion) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFeature(null), 300);
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background overflow-hidden">
      {/* Animated background gradient orbs - stronger contrast */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-black/8 dark:bg-white/5 rounded-full blur-[120px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E9DFCE]/25 dark:bg-[#BBAE96]/15 rounded-full blur-[100px]"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-black/5 dark:bg-white/3 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {/* Glass header with backdrop blur */}
        <motion.header 
          className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-surface)]/95 border-b border-[var(--color-border)]"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Sparkles className="w-5 h-5 text-foreground animate-pulse" />
                <h2 className="font-display font-bold text-2xl text-foreground">$ave+</h2>
              </motion.div>
              <motion.div
                className="hidden md:flex gap-4 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  All systems operational
                </span>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="container mx-auto px-4 py-12 md:py-20 space-y-32">
          {/* Hero Section with parallax - Off-white foundation */}
          <motion.section 
            ref={heroRef}
            className="space-y-8 relative bg-[var(--color-bg)] -mx-4 px-4 lg:-mx-20 lg:px-20 py-12 rounded-2xl"
            style={{ y: parallaxY, opacity }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <WelcomeHero />
              </motion.div>
              
              <motion.div 
                className="relative w-full max-w-md mx-auto lg:max-w-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                style={{
                  transform: `perspective(1000px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${-mousePosition.y * 0.5}deg)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-secondary/30 blur-3xl animate-glow" />
                {animationData && (
                  <div className="relative">
                    <LottieHero 
                      animationData={animationData}
                      autoplay
                      loop
                      className="w-full h-auto drop-shadow-2xl"
                    />
                  </div>
                )}
              </motion.div>
            </div>
            
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <SearchBarHinted />
            </motion.div>
          </motion.section>

          {/* Mission Control Features with scroll animations - Pure white section */}
          <motion.section 
            ref={featuresRef}
            aria-label="Features"
            className="bg-[var(--color-surface)] -mx-4 px-4 lg:-mx-20 lg:px-20 py-20 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={featuresInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={featuresInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className="h-1 w-12 bg-gradient-to-r from-foreground to-transparent rounded-full" />
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                Mission Control
              </h2>
            </motion.div>
            <FeatureCarousel features={features} onFeatureClick={handleFeatureClick} />
          </motion.section>

          {/* Stats Section with stagger animation - Beige accent zone */}
          <motion.section 
            ref={statsRef}
            aria-label="Statistics"
            className="relative bg-[var(--color-accent)]/40 dark:bg-[var(--color-accent)]/15 -mx-4 px-4 lg:-mx-20 lg:px-20 py-20 rounded-3xl"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-3xl blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <div className="relative">
              <motion.div
                className="flex items-center gap-3 mb-8"
                initial={{ opacity: 0, x: -20 }}
                animate={statsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                <div className="h-1 w-12 bg-gradient-to-r from-foreground to-transparent rounded-full" />
                <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                  Why Choose $ave+?
                </h2>
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={statsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <StatCard
                      label={stat.label}
                      value={stat.value}
                      delay={0}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Secure Onboarding CTA - White surface */}
          <motion.section 
            aria-label="Get started"
            className="bg-[var(--color-surface)] -mx-4 px-4 lg:-mx-20 lg:px-20 py-20 rounded-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <SecureOnboardingCTA />
          </motion.section>
        </main>

        <footer className="relative container mx-auto px-4 py-12 mt-20 border-t border-border/50">
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <p className="text-muted-foreground">Powered by $ave+</p>
            </div>
            <div className="flex gap-6">
              <motion.a 
                href="/privacy" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Privacy
              </motion.a>
              <motion.a 
                href="/terms" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Terms
              </motion.a>
            </div>
          </motion.div>
        </footer>

        <FeatureDetailModal
          feature={selectedFeature}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
        
        {/* Floating Widgets */}
        <SaveplusCoachWidget />
        <SaveplusUIAssistantFAB />
      </motion.div>
    </div>
  );
};

export default Welcome;

