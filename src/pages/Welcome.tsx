import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Sparkles } from "lucide-react";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { LottieHero } from "@/components/welcome/LottieHero";
import { FeatureCarousel, Feature } from "@/components/welcome/FeatureCarousel";
import { FlippableFeatureCard } from "@/components/welcome/FlippableFeatureCard";
import { JourneyTimeline } from "@/components/welcome/JourneyTimeline";
import { ExpandableStatCard } from "@/components/welcome/ExpandableStatCard";
import { LiveActivityTicker } from "@/components/welcome/LiveActivityTicker";
import { SavingsPlayground } from "@/components/welcome/SavingsPlayground";
import { CustomCursor } from "@/components/welcome/CustomCursor";
import { ClickerGame } from "@/components/welcome/ClickerGame";
import { MoodToggle } from "@/components/welcome/MoodToggle";
import { FeatureDetailModal } from "@/components/welcome/FeatureDetailModal";
import { FeatureTour, hasCompletedTour } from "@/components/welcome/FeatureTour";
import { StatCard } from "@/components/welcome/StatCard";
import { SearchBarHinted } from "@/components/search/SearchBarHinted";
import { SecureOnboardingCTA } from "@/components/welcome/SecureOnboardingCTA";
import { SaveplusCoachWidget } from "@/components/coach/SaveplusCoachWidget";
import { SaveplusUIAssistantFAB } from "@/components/assistant/SaveplusUIAssistantFAB";
import { PullToRefreshStats } from "@/components/mobile/PullToRefreshStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useKonamiCode } from "@/hooks/useKonamiCode";
import { trackPageView, saveplus_audit_event } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import NeutralBackground from "@/components/background/NeutralBackground";
import NeutralConfetti from "@/components/effects/NeutralConfetti";
import { ParallaxBackground } from "@/components/welcome/ParallaxBackground";
import { MouseGradient } from "@/components/welcome/MouseGradient";
import { ScrollGradient } from "@/components/welcome/ScrollGradient";
import { Users, DollarSign, TrendingUp, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const features: Feature[] = [
  {
    id: "smart-pots",
    icon: "pots",
    title: "Smart Savings Pots",
    description: "Create dedicated goals and track progress with unlimited pots, auto-allocations, and shared access.",
    summary: "Create dedicated goals and track progress with unlimited pots, auto-allocations, and shared access.",
    details: "Unlimited pots with targets and dates. Auto-allocate new deposits by percentage. Lock/unlock rules, notes, shared view access, and attachments.",
  },
  {
    id: "automated-savings",
    icon: "automations",
    title: "Automated Savings",
    description: "Set rules that save for you automatically—round-ups, paycheck skims, and scheduled transfers.",
    summary: "Set rules that save for you automatically—round-ups, paycheck skims, and scheduled transfers.",
    details: "Round-ups from card spend, paycheck skim %, threshold sweeps, and safe-to-save checks. Scheduled weekly/biweekly deposits with pause/resume.",
  },
  {
    id: "ave-plus-card",
    icon: "card",
    title: "$ave+ Credit Card",
    description: "Build credit with real-time controls, instant freeze, and category insights.",
    summary: "Build credit with real-time controls, instant freeze, and category insights.",
    details: "Smart limits, instant freeze, category insights, statement reminders, and rewards posting. Disclosures available in-app.",
  },
  {
    id: "financial-insights",
    icon: "insights",
    title: "Financial Insights",
    description: "Know where you stand with savings rate, time-to-goal, and net worth tracking.",
    summary: "Know where you stand with savings rate, time-to-goal, and net worth tracking.",
    details: "Savings rate, time-to-goal, APY history, interest earned, contributions by pot, and net worth across linked accounts. CSV/PDF export.",
  },
  {
    id: "rewards-program",
    icon: "rewards",
    title: "Rewards Program",
    description: "Earn points for streaks and milestones, with boosters on goal completion.",
    summary: "Earn points for streaks and milestones, with boosters on goal completion.",
    details: "Points for streaks and milestones, boosters on goal completion, and perks for higher monthly support tiers.",
  },
  {
    id: "ai-coach",
    icon: "bot",
    title: "AI Coach",
    description: "Get 24/7 guided help with step-by-step tasks and progress summaries.",
    summary: "Get 24/7 guided help with step-by-step tasks and progress summaries.",
    details: "Step-by-step tasks for linking bank, creating pots, drafting transfers, enabling automations, and summarizing progress. Not financial advice.",
  },
  {
    id: "bank-security",
    icon: "shield",
    title: "Bank-Level Security",
    description: "Protect your account with MFA, encryption, and device management.",
    summary: "Protect your account with MFA, encryption, and device management.",
    details: "MFA, device/session management, encryption in transit/at rest, consent logs, and data export/delete controls.",
  },
];

const stats = [
  { label: "APY Rate", value: "4.25%", icon: "trending-up" },
  { label: "Happy Users", value: "50K+", icon: "users" },
  { label: "Saved Together", value: "$2.1M+", icon: "money" },
  { label: "Uptime", value: "99.9%", icon: "shield" },
];

const Welcome = () => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [user, setUser] = useState<any>(null);
  const [userProgress, setUserProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [featuresLoaded, setFeaturesLoaded] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [ctaLoaded, setCtaLoaded] = useState(false);
  const [showClickerGame, setShowClickerGame] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [konamiUnlocked, setKonamiUnlocked] = useState(false);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  // Konami code detection
  const { success: konamiSuccess } = useKonamiCode(() => {
    setShowConfetti(true);
    setKonamiUnlocked(true);
    toast.success("🎉 Secret Saver Badge Unlocked!", {
      description: "You found the hidden achievement!",
      duration: 5000,
    });
    setTimeout(() => setShowConfetti(false), 3000);
  });
  
  // Track loading start time
  const loadStartTimeRef = useRef<number>(Date.now());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  
  // Calculate user progress based on available data
  const calculateUserProgress = (userData: any) => {
    let progress = 0;
    if (userData?.email) progress += 0.1;
    if (userData?.user_metadata?.full_name) progress += 0.1;
    if (userData?.user_metadata?.avatar_url) progress += 0.1;
    return Math.min(progress + 0.12, 1);
  };
  
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

  // Track page view on mount and check for first visit
  useEffect(() => {
    trackPageView('Welcome');
    
    // Show tour on first visit
    const tourCompleted = hasCompletedTour();
    if (!tourCompleted) {
      // Delay tour slightly to let page load
      const timer = setTimeout(() => {
        setShowTour(true);
        saveplus_audit_event('tour_started', {
          route: location.pathname
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Check authentication and calculate progress
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: userData } } = await supabase.auth.getUser();
        if (userData) {
          setUser(userData);
          const progress = calculateUserProgress(userData);
          setUserProgress(progress);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Progressive loading: load sections sequentially with analytics
  useEffect(() => {
    if (!isLoading) {
      const authLoadTime = Date.now() - loadStartTimeRef.current;
      
      // Track auth check duration
      saveplus_audit_event('section_loaded', {
        section: 'auth_check',
        load_time_ms: authLoadTime,
        route: location.pathname
      });
      
      // Hero loads immediately after auth check
      setHeroLoaded(true);
      saveplus_audit_event('section_loaded', {
        section: 'hero',
        load_time_ms: authLoadTime,
        route: location.pathname
      });
      
      // Features load after 300ms
      const featuresTimer = setTimeout(() => {
        setFeaturesLoaded(true);
        saveplus_audit_event('section_loaded', {
          section: 'features',
          load_time_ms: Date.now() - loadStartTimeRef.current,
          route: location.pathname
        });
      }, 300);
      
      // Stats load after 600ms
      const statsTimer = setTimeout(() => {
        setStatsLoaded(true);
        saveplus_audit_event('section_loaded', {
          section: 'stats',
          load_time_ms: Date.now() - loadStartTimeRef.current,
          route: location.pathname
        });
      }, 600);
      
      // CTA loads after 900ms
      const ctaTimer = setTimeout(() => {
        setCtaLoaded(true);
        const totalLoadTime = Date.now() - loadStartTimeRef.current;
        saveplus_audit_event('section_loaded', {
          section: 'cta',
          load_time_ms: totalLoadTime,
          route: location.pathname
        });
        
        // Track complete page load
        saveplus_audit_event('page_fully_loaded', {
          total_load_time_ms: totalLoadTime,
          route: location.pathname
        });
      }, 900);
      
      return () => {
        clearTimeout(featuresTimer);
        clearTimeout(statsTimer);
        clearTimeout(ctaTimer);
      };
    }
  }, [isLoading, location.pathname]);

  // Theme toggle deduplication
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll('[data-theme-toggle="1"]')
    );
    
    if (nodes.length > 1) {
      saveplus_audit_event('toggle_dedup', {
        count: nodes.length,
        route: location.pathname
      });
      
      nodes.slice(1).forEach((n) => {
        (n as HTMLElement).style.display = 'none';
        n.setAttribute('aria-hidden', 'true');
      });
    }
    
    return () => {
      nodes.slice(1).forEach((n) => {
        (n as HTMLElement).style.display = '';
        n.removeAttribute('aria-hidden');
      });
    };
  }, [location.pathname]);

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
    saveplus_audit_event('feature_clicked', {
      feature_id: feature.id,
      feature_title: feature.title
    });
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFeature(null), 300);
  };

  const handleTourComplete = () => {
    saveplus_audit_event('tour_completed', {
      route: location.pathname
    });
    setShowTour(false);
  };

  const handleTourSkip = () => {
    saveplus_audit_event('tour_skipped', {
      route: location.pathname,
      step: 'early'
    });
    setShowTour(false);
  };

  const handleRestartTour = () => {
    saveplus_audit_event('tour_restarted', {
      route: location.pathname
    });
    setShowTour(true);
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background overflow-hidden">
      {/* Enhanced Background Effects - Phase 7 */}
      <ScrollGradient />
      <NeutralBackground />
      <ParallaxBackground />
      <MouseGradient />
      
      {/* Custom Cursor for desktop */}
      <CustomCursor />
      
      {/* Konami Code Confetti */}
      <NeutralConfetti show={showConfetti} />
      
      {/* Clicker Game Modal */}
      <ClickerGame isOpen={showClickerGame} onClose={() => setShowClickerGame(false)} />
      
      {/* Konami Badge */}
      {konamiSuccess && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="fixed top-20 right-4 z-40"
        >
          <Badge className="bg-accent text-accent-foreground px-4 py-2 shadow-lg">
            <Trophy className="w-4 h-4 mr-2" />
            Secret Saver
          </Badge>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {/* Header with neutral styling */}
        <motion.header 
          className="sticky top-0 z-50 backdrop-blur-xl bg-background/95 border-b border-[color:var(--color-border)]"
          initial={prefersReducedMotion ? false : { y: -100 }}
          animate={prefersReducedMotion ? false : { y: 0 }}
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
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  All systems operational
                </span>
                <MoodToggle />
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="container mx-auto px-4 py-12 md:py-20 space-y-32">
          {/* Hero Section with parallax - Neutral styling */}
          <motion.section 
            ref={heroRef}
            className="space-y-8 relative bg-background -mx-4 px-4 lg:-mx-20 lg:px-20 py-12 rounded-2xl border border-[color:var(--color-border)]"
            style={prefersReducedMotion ? {} : { y: parallaxY, opacity }}
          >
            {!heroLoaded ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-3/4 rounded-lg" />
                    <Skeleton className="h-6 w-full rounded-lg" />
                    <Skeleton className="h-6 w-5/6 rounded-lg" />
                    <div className="flex gap-4 pt-4">
                      <Skeleton className="h-12 w-48 rounded-lg" />
                      <Skeleton className="h-12 w-36 rounded-lg" />
                    </div>
                  </div>
                  <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            ) : (
              <>
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
              </>
            )}
          </motion.section>

          {/* Mission Control Features with scroll animations - Pure white section */}
          <motion.section 
            ref={featuresRef}
            aria-label="Features"
            className="bg-[color:var(--color-surface)] -mx-4 px-4 lg:-mx-20 lg:px-20 py-20 rounded-2xl"
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
                <div className="h-1 w-12 bg-gradient-to-r from-[color:var(--color-accent)] to-transparent rounded-full" />
                <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                  Mission Control
                </h2>
              </motion.div>
            {!featuresLoaded ? (
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-xl" />
                <div className="flex justify-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-2 w-2 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Flippable Feature Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.slice(0, 6).map((feature, index) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <FlippableFeatureCard
                        {...feature}
                        badge={index === 0 ? "Most Popular" : index === 1 ? "New" : undefined}
                        onLearnMore={() => handleFeatureClick(feature)}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Journey Timeline */}
                <JourneyTimeline />
              </div>
            )}
          </motion.section>

          {/* Stats Section with stagger animation - Beige accent zone */}
          <motion.section 
            ref={statsRef}
            aria-label="Statistics"
            className="relative bg-[color:var(--color-accent)]/40 dark:bg-[color:var(--color-accent)]/15 -mx-4 px-4 lg:-mx-20 lg:px-20 py-20 rounded-3xl"
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
                <div className="h-1 w-12 bg-gradient-to-r from-[color:var(--color-accent)] to-transparent rounded-full" />
                <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                  Why Choose $ave+?
                </h2>
              </motion.div>
              <PullToRefreshStats onRefresh={async () => {
                // Simulate refresh
                await new Promise(resolve => setTimeout(resolve, 1000));
                toast.success("Stats refreshed!");
              }}>
                <div className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {!statsLoaded ? (
                    <>
                      {[...Array(3)].map((_, index) => (
                        <Skeleton key={index} className="h-40 w-full rounded-2xl" />
                      ))}
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={statsInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0, duration: 0.5 }}
                      >
                        <ExpandableStatCard
                          label="Active Savers"
                          value={50000}
                          suffix="+"
                          icon={<Users className="w-8 h-8" />}
                          delay={0}
                          breakdown={[
                            { label: "This Month", value: "2,340", percentage: 75 },
                            { label: "This Week", value: "580", percentage: 45 },
                            { label: "Today", value: "120", percentage: 25 },
                          ]}
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={statsInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1, duration: 0.5 }}
                      >
                        <ExpandableStatCard
                          label="Total Saved"
                          value={2.1}
                          suffix="M+"
                          icon={<DollarSign className="w-8 h-8" />}
                          delay={0.1}
                          breakdown={[
                            { label: "Automated Savings", value: "$1.2M", percentage: 57 },
                            { label: "Round-ups", value: "$600K", percentage: 28 },
                            { label: "Manual Transfers", value: "$300K", percentage: 15 },
                          ]}
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={statsInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        <ExpandableStatCard
                          label="Average APY"
                          value={4.25}
                          suffix="%"
                          icon={<TrendingUp className="w-8 h-8" />}
                          delay={0.2}
                        />
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Live Activity Ticker */}
                {statsLoaded && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={statsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    onDoubleClick={() => setShowClickerGame(true)}
                    className="cursor-pointer"
                    title="Double-click for a surprise!"
                  >
                    <LiveActivityTicker />
                  </motion.div>
                )}
                </div>
              </PullToRefreshStats>
            </div>
          </motion.section>

          {/* Interactive Savings Playground */}
          <motion.section
            aria-label="Try savings calculator"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <SavingsPlayground />
          </motion.section>

          {/* Secure Onboarding CTA - White surface */}
          <motion.section 
            aria-label="Get started"
            className="bg-[color:var(--color-surface)] -mx-4 px-4 lg:-mx-20 lg:px-20 py-20 rounded-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            {!ctaLoaded ? (
              <div className="space-y-6 text-center">
                <Skeleton className="h-10 w-3/4 mx-auto rounded-lg" />
                <Skeleton className="h-6 w-full max-w-2xl mx-auto rounded-lg" />
                <Skeleton className="h-6 w-5/6 max-w-2xl mx-auto rounded-lg" />
                <Skeleton className="h-12 w-48 mx-auto rounded-lg mt-8" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SecureOnboardingCTA />
              </motion.div>
            )}
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
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <motion.button
                onClick={handleRestartTour}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Restart feature tour"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                Restart Tour
              </motion.button>
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

        {/* Feature Tour */}
        {showTour && (
          <FeatureTour
            features={features}
            onComplete={handleTourComplete}
            onSkip={handleTourSkip}
          />
        )}
        
        {/* Floating Widgets */}
        <SaveplusCoachWidget />
        <SaveplusUIAssistantFAB />
      </motion.div>
    </div>
  );
};

export default Welcome;

