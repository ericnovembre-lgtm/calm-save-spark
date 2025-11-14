import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Sparkles } from "lucide-react";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { FeatureDetailModal } from "@/components/welcome/FeatureDetailModal";
import { FeatureTour, hasCompletedTour } from "@/components/welcome/FeatureTour";
import { StatCard } from "@/components/welcome/StatCard";
import { SearchBarHinted } from "@/components/search/SearchBarHinted";
import { SecureOnboardingCTA } from "@/components/welcome/SecureOnboardingCTA";
import { SaveplusCoachWidget } from "@/components/coach/SaveplusCoachWidget";
import { SaveplusUIAssistantFAB } from "@/components/assistant/SaveplusUIAssistantFAB";
import { Skeleton } from "@/components/ui/skeleton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useKonamiCode } from "@/hooks/useKonamiCode";
import { trackPageView, saveplus_audit_event } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import NeutralBackground from "@/components/background/NeutralBackground";
import NeutralConfetti from "@/components/effects/NeutralConfetti";
import { GestureHandler, PinchZoomWrapper } from "@/components/welcome/GestureHandler";
import { SoundToggle } from "@/components/welcome/SoundToggle";
import { Users, DollarSign, TrendingUp, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LazyLoad } from "@/components/performance/LazyLoad";
import { ProgressiveLoader } from "@/components/performance/ProgressiveLoader";
import LazyErrorBoundary from "@/components/performance/LazyErrorBoundary";
import DebugPanel from "@/components/debug/DebugPanel";
import { useWebVitals } from "@/hooks/useWebVitals";
import { useIntelligentPrefetch } from "@/hooks/useIntelligentPrefetch";
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";
import { WelcomeLoadingSkeleton } from "@/components/welcome/WelcomeLoadingSkeleton";
import { PerformanceMonitoringDashboard } from "@/components/performance/PerformanceMonitoringDashboard";
import { usePerformanceBudgetAlerts } from "@/hooks/usePerformanceBudgetAlerts";
import type { Feature } from "@/components/welcome/FeatureCarousel";

// Lazy load heavy components for better performance
const LottieHero = lazy(() => import("@/components/welcome/LottieHero").then(m => ({ default: m.LottieHero })));
const FeatureCarousel = lazy(() => import("@/components/welcome/FeatureCarousel").then(m => ({ default: m.FeatureCarousel })));
const FlippableFeatureCard = lazy(() => import("@/components/welcome/FlippableFeatureCard").then(m => ({ default: m.FlippableFeatureCard })));
const JourneyTimeline = lazy(() => import("@/components/welcome/JourneyTimeline").then(m => ({ default: m.JourneyTimeline })));
const ExpandableStatCard = lazy(() => import("@/components/welcome/ExpandableStatCard").then(m => ({ default: m.ExpandableStatCard })));
const LiveActivityTicker = lazy(() => import("@/components/welcome/LiveActivityTicker").then(m => ({ default: m.LiveActivityTicker })));
const SavingsPlayground = lazy(() => import("@/components/welcome/SavingsPlayground").then(m => ({ default: m.SavingsPlayground })));
const CustomCursor = lazy(() => import("@/components/welcome/CustomCursor").then(m => ({ default: m.CustomCursor })));
const ClickerGame = lazy(() => import("@/components/welcome/ClickerGame").then(m => ({ default: m.ClickerGame })));
const MoodToggle = lazy(() => import("@/components/welcome/MoodToggle").then(m => ({ default: m.MoodToggle })));
const PullToRefreshStats = lazy(() => import("@/components/mobile/PullToRefreshStats").then(m => ({ default: m.PullToRefreshStats })));
const ParallaxBackground = lazy(() => import("@/components/welcome/ParallaxBackground").then(m => ({ default: m.ParallaxBackground })));
const ParticleBackground = lazy(() => import("@/components/welcome/ParticleBackground").then(m => ({ default: m.ParticleBackground })));
const MouseGradient = lazy(() => import("@/components/welcome/MouseGradient").then(m => ({ default: m.MouseGradient })));
const ScrollGradient = lazy(() => import("@/components/welcome/ScrollGradient").then(m => ({ default: m.ScrollGradient })));

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

  // Initialize Web Vitals monitoring
  useWebVitals(true);
  
  // Initialize performance budget alerts (dev only)
  usePerformanceBudgetAlerts(import.meta.env.DEV);
  
  // Initialize intelligent prefetching
  const { connectionSpeed } = useIntelligentPrefetch();
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
  
  // Log page mount
  useEffect(() => {
    console.log('[Welcome] Page mounted', {
      timestamp: new Date().toISOString(),
      route: location.pathname,
      loadStartTime: loadStartTimeRef.current
    });
    
    return () => {
      const totalLoadTime = Date.now() - loadStartTimeRef.current;
      console.log('[Welcome] Page unmounted', {
        timestamp: new Date().toISOString(),
        totalLifetime: totalLoadTime
      });
    };
  }, []);
  
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
    : useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);

  // Debug: Log opacity issues
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (typeof opacity === 'object' && 'get' in opacity) {
        const currentOpacity = opacity.get();
        if (currentOpacity < 0.5) {
          console.warn('[Welcome] Low opacity detected', {
            opacity: currentOpacity,
            scrollProgress: scrollYProgress.get(),
            timestamp: new Date().toISOString()
          });
        }
      }
    }, 2000);
    
    return () => clearInterval(checkInterval);
  }, [opacity, scrollYProgress]);

  // Track page view on mount and check for first visit
  useEffect(() => {
    console.log('[Welcome] Tracking page view');
    trackPageView('Welcome');
    
    // Show tour on first visit
    const tourCompleted = hasCompletedTour();
    console.log('[Welcome] Tour status:', { completed: tourCompleted });
    
    if (!tourCompleted) {
      // Delay tour slightly to let page load
      const timer = setTimeout(() => {
        console.log('[Welcome] Starting tour');
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
    const authStartTime = Date.now();
    console.log('[Welcome] Starting auth check');
    
    const checkAuth = async () => {
      try {
        const { data: { user: userData } } = await supabase.auth.getUser();
        const authDuration = Date.now() - authStartTime;
        
        if (userData) {
          console.log('[Welcome] User authenticated', {
            userId: userData.id,
            email: userData.email,
            duration: authDuration
          });
          
          setUser(userData);
          const progress = calculateUserProgress(userData);
          setUserProgress(progress);
          
          saveplus_audit_event('auth_check_complete', {
            auth_state: 'authenticated',
            duration_ms: authDuration,
            user_id: userData.id,
            route: location.pathname
          });
        } else {
          console.log('[Welcome] User not authenticated', {
            duration: authDuration
          });
          
          saveplus_audit_event('auth_check_complete', {
            auth_state: 'unauthenticated',
            duration_ms: authDuration,
            route: location.pathname
          });
        }
      } catch (error) {
        const authDuration = Date.now() - authStartTime;
        console.error('[Welcome] Auth check failed', error);
        
        saveplus_audit_event('auth_check_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          duration_ms: authDuration,
          route: location.pathname
        });
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();

    // Timeout fallback: force loading complete after 5 seconds
    const authTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('[Welcome] Auth check timeout - forcing load completion');
        setIsLoading(false);
        saveplus_audit_event('auth_timeout_fallback', {
          route: location.pathname,
          timeout_ms: 5000
        });
      }
    }, 5000);

    return () => clearTimeout(authTimeout);
  }, [location.pathname]);

  // Progressive loading: load sections sequentially with analytics
  useEffect(() => {
    if (!isLoading) {
      const authLoadTime = Date.now() - loadStartTimeRef.current;
      
      console.log('[Welcome] Auth check completed', {
        duration: authLoadTime,
        user: user ? 'authenticated' : 'unauthenticated'
      });
      
      // Track auth check duration
      saveplus_audit_event('section_loaded', {
        section: 'auth_check',
        load_time_ms: authLoadTime,
        route: location.pathname
      });

      // Dispatch performance metric event
      window.dispatchEvent(new CustomEvent('performance_metric', {
        detail: { metric: 'auth_check', value: authLoadTime }
      }));
      
      // Load all sections immediately to prevent blank page
      setHeroLoaded(true);
      setFeaturesLoaded(true);
      setStatsLoaded(true);
      setCtaLoaded(true);
      
      console.log('[Welcome] All sections loaded immediately');
      
      // Track metrics
      saveplus_audit_event('section_loaded', {
        section: 'all',
        load_time_ms: authLoadTime,
        route: location.pathname
      });

      // Dispatch metrics
      window.dispatchEvent(new CustomEvent('performance_metric', {
        detail: { metric: 'hero_load', value: authLoadTime }
      }));
      window.dispatchEvent(new CustomEvent('performance_metric', {
        detail: { metric: 'features_load', value: authLoadTime }
      }));
      window.dispatchEvent(new CustomEvent('performance_metric', {
        detail: { metric: 'stats_load', value: authLoadTime }
      }));
      window.dispatchEvent(new CustomEvent('performance_metric', {
        detail: { metric: 'cta_load', value: authLoadTime }
      }));
      window.dispatchEvent(new CustomEvent('performance_metric', {
        detail: { metric: 'page_load', value: authLoadTime }
      }));
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

  // Track landing route analytics
  useEffect(() => {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    
    saveplus_audit_event('landing_page_visit', {
      route: location.pathname,
      referrer: referrer || 'direct',
      utm_source: utmSource || 'none',
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
    
    console.log('[Welcome] Landing analytics tracked', {
      route: location.pathname,
      referrer
    });
  }, [location.pathname]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    console.log('[Welcome] Fetching animation data');
    
    fetch("/animations/saveplus-hero-optimized.json", { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        clearTimeout(timeoutId);
        setAnimationData(data);
        console.log('[Welcome] Animation loaded successfully');
        saveplus_audit_event('animation_loaded', {
          route: location.pathname
        });
      })
      .catch(err => {
        clearTimeout(timeoutId);
        console.warn('[Welcome] Animation load failed:', err.message);
        setAnimationData({}); // Trigger fallback
        saveplus_audit_event('animation_load_failed', {
          error: err.message,
          route: location.pathname
        });
      });
      
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [location.pathname]);

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

  // Show loading skeleton only while auth is being checked
  if (isLoading) {
    return <WelcomeLoadingSkeleton />;
  }

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background overflow-hidden">
      {/* Performance Monitoring Dashboard */}
      <PerformanceMonitoringDashboard />
      
      {/* Enhanced Background Effects - Phase 7 (Progressive Enhancement) */}
      <NeutralBackground />
      
      {/* Background layers container - forced behind all content */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0" style={{ zIndex: 'var(--z-background)' }}>
        <ProgressiveLoader priority="low" delay={500}>
          <LazyErrorBoundary 
            componentName="ScrollGradient" 
            fallbackHeight="100vh" 
            background
            timeoutMs={10000}
            onLoadStart={() => console.log('[Welcome] ScrollGradient loading started')}
            onLoadComplete={() => console.log('[Welcome] ScrollGradient loaded')}
          >
            <ScrollGradient />
          </LazyErrorBoundary>
        </ProgressiveLoader>
        <ProgressiveLoader priority="low" delay={700}>
          <LazyErrorBoundary 
            componentName="ParallaxBackground" 
            fallbackHeight="100vh" 
            background
            timeoutMs={10000}
            onLoadStart={() => console.log('[Welcome] ParallaxBackground loading started')}
            onLoadComplete={() => console.log('[Welcome] ParallaxBackground loaded')}
          >
            <ParallaxBackground />
          </LazyErrorBoundary>
        </ProgressiveLoader>
        <ProgressiveLoader priority="low" delay={900}>
          <LazyErrorBoundary 
            componentName="ParticleBackground" 
            fallbackHeight="100vh" 
            background
            timeoutMs={10000}
            onLoadStart={() => console.log('[Welcome] ParticleBackground loading started')}
            onLoadComplete={() => console.log('[Welcome] ParticleBackground loaded')}
          >
            <ParticleBackground />
          </LazyErrorBoundary>
        </ProgressiveLoader>
        <ProgressiveLoader priority="low" delay={1100}>
          <LazyErrorBoundary 
            componentName="MouseGradient" 
            fallbackHeight="100vh" 
            background
            timeoutMs={10000}
            onLoadStart={() => console.log('[Welcome] MouseGradient loading started')}
            onLoadComplete={() => console.log('[Welcome] MouseGradient loaded')}
          >
            <MouseGradient />
          </LazyErrorBoundary>
        </ProgressiveLoader>
      </div>
      
      {/* Gesture Handler - Phase 8 */}
      <GestureHandler enableShakeToConfetti={true}>
        {/* Custom Cursor for desktop (Progressive) */}
        <ProgressiveLoader priority="low" delay={600}>
          <Suspense fallback={null}>
            <CustomCursor />
          </Suspense>
        </ProgressiveLoader>
        
        {/* Konami Code Confetti */}
        <NeutralConfetti show={showConfetti} />
        
        {/* Clicker Game Modal (Lazy Loaded) */}
        <Suspense fallback={null}>
          <ClickerGame isOpen={showClickerGame} onClose={() => setShowClickerGame(false)} />
        </Suspense>
        
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
        className="relative"
        style={{ zIndex: 'var(--z-content-base)' } as React.CSSProperties}
      >
        {/* Header with neutral styling */}
        <motion.header 
          className="sticky top-0 backdrop-blur-xl bg-background/95 border-b border-[color:var(--color-border)]"
          style={{ zIndex: 'var(--z-content-priority)' } as React.CSSProperties}
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
                <Suspense fallback={<div className="w-10 h-10" />}>
                  <LazyErrorBoundary componentName="MoodToggle" fallbackHeight="40px">
                    <MoodToggle />
                  </LazyErrorBoundary>
                </Suspense>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="relative container mx-auto px-4 py-12 md:py-20 space-y-32" style={{ zIndex: 'var(--z-content-elevated)' } as React.CSSProperties}>
          {/* Hero Section with parallax - Neutral styling */}
          <motion.section 
            ref={heroRef}
            className="space-y-8 relative bg-background -mx-4 px-4 lg:-mx-20 lg:px-20 py-12 rounded-2xl border border-[color:var(--color-border)]"
            style={prefersReducedMotion ? { zIndex: 'var(--z-content-priority)' } as React.CSSProperties : { y: parallaxY, opacity: scrollYProgress.get() < 0.1 ? 1 : opacity, zIndex: 'var(--z-content-priority)' } as React.CSSProperties}
          >
            {/* Hero content - always visible */}
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
                {animationData ? (
                  <div className="relative">
                    <LazyErrorBoundary componentName="LottieHero" fallbackHeight="384px">
                      <LottieHero 
                        animationData={animationData}
                        autoplay
                        loop
                        className="w-full h-auto drop-shadow-2xl"
                        authState={user ? 'authenticated' : (isLoading ? 'checking' : 'unauthenticated')}
                      />
                    </LazyErrorBoundary>
                  </div>
                ) : (
                  <Skeleton className="h-96 w-full rounded-2xl" />
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
          <LazyLoad minHeight="600px" rootMargin="100px">
            <motion.section 
              ref={featuresRef}
              aria-label="Features"
              className="relative z-20 bg-[color:var(--color-surface)] -mx-4 px-4 lg:-mx-20 lg:px-20 py-20 rounded-2xl"
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
                  <LazyErrorBoundary componentName="FlippableFeatureCard" fallbackHeight="256px">
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
                  </LazyErrorBoundary>
                </div>

                {/* Journey Timeline */}
                <LazyErrorBoundary componentName="JourneyTimeline" fallbackHeight="256px">
                  <JourneyTimeline />
                </LazyErrorBoundary>
                </div>
              )}
            </motion.section>
          </LazyLoad>

          {/* Stats Section with stagger animation - Beige accent zone */}
          <LazyLoad minHeight="500px" rootMargin="150px">
            <motion.section 
              ref={statsRef}
              aria-label="Statistics"
              className="relative z-20 bg-[color:var(--color-accent)]/40 dark:bg-[color:var(--color-accent)]/15 -mx-4 px-4 lg:-mx-20 lg:px-20 py-20 rounded-3xl"
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
              <LazyErrorBoundary componentName="PullToRefreshStats" fallbackHeight="400px">
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
                      <LazyErrorBoundary componentName="LiveActivityTicker" fallbackHeight="64px">
                        <LiveActivityTicker />
                      </LazyErrorBoundary>
                    </motion.div>
                  )}
                  </div>
                </PullToRefreshStats>
              </LazyErrorBoundary>
              </div>
            </motion.section>
          </LazyLoad>

          {/* Interactive Savings Playground */}
          <LazyLoad minHeight="600px" rootMargin="200px">
            <motion.section
              aria-label="Try savings calculator"
              className="relative z-20"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <LazyErrorBoundary componentName="SavingsPlayground" fallbackHeight="600px">
                <SavingsPlayground />
              </LazyErrorBoundary>
            </motion.section>
          </LazyLoad>

          {/* Secure Onboarding CTA - White surface */}
          <motion.section 
            aria-label="Get started"
            className="relative z-20 bg-[color:var(--color-surface)] -mx-4 px-4 lg:-mx-20 lg:px-20 py-20 rounded-2xl"
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

        <footer className="relative z-10 container mx-auto px-4 py-12 mt-20 border-t border-border/50">
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
        
        {/* Sound Toggle - Phase 9 (Progressive Enhancement) */}
        <ProgressiveLoader priority="low" delay={800}>
          <SoundToggle />
        </ProgressiveLoader>

        {/* Network Status Indicator */}
        <NetworkStatusIndicator />

        {/* Debug Panel - Development Only */}
        <DebugPanel
          loadingStates={{
            hero: heroLoaded,
            features: featuresLoaded,
            stats: statsLoaded,
            cta: ctaLoaded,
          }}
        />
      </motion.div>
      </GestureHandler>
    </div>
  );
};

export default Welcome;

