import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackSubscriptionEvent } from "@/lib/subscription-analytics";
import { saveplus_audit_event } from "@/lib/analytics";
import { FREEMIUM_FEATURE_ORDER } from "@/lib/constants";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { 
  AlertTriangle,
  CreditCard,
  Sparkles,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp,
  List,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useStripeHealth } from "@/hooks/useStripeHealth";
import EnhancedPricingSlider from "@/components/pricing/advanced/EnhancedPricingSlider";
import FeatureItem from "@/components/pricing/FeatureItem";
import ValueEarnedCard from "@/components/pricing/ValueEarnedCard";
import ProjectedSavingsCard from "@/components/pricing/ProjectedSavingsCard";
import TierBadge, { getTierForAmount } from "@/components/pricing/TierBadge";
import AnimatedFeatureTable from "@/components/pricing/advanced/AnimatedFeatureTable";
import TierUpgradeModal from "@/components/pricing/TierUpgradeModal";
import TierInfoModal from "@/components/pricing/TierInfoModal";
import CheckoutConfirmationModal from "@/components/pricing/CheckoutConfirmationModal";
import DowngradeWarningModal from "@/components/pricing/DowngradeWarningModal";
import TierPreviewBar from "@/components/pricing/TierPreviewBar";
import ScrollingTicker from "@/components/pricing/advanced/ScrollingTicker";
import CelebrationSystem from "@/components/pricing/advanced/CelebrationSystem";
import StaggeredContainer, { StaggeredItem } from "@/components/pricing/advanced/StaggeredContainer";
import { motion } from "framer-motion";

// Advanced pricing components (lazy loaded)
import {
  LazyAIPriceRecommender,
  LazyPricing3DDisc,
  LazyHolographicValueCard,
  LazyLiveSavingsCounter,
  LazyAIROICalculator,
  LazyFeatureComparisonMatrix,
  LazyTierJourneyMap,
  LazyGamifiedSavingsSimulator,
  LazyPricingConstellation,
  LazyPricingChatbot,
  LazyAchievementBadges,
  LazyRealTimeActivityFeed,
} from "@/components/pricing/LazyPricingAdvanced";

export default function Pricing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'tier-unlock' | 'checkout' | 'success'>('success');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [targetUpgradeAmount, setTargetUpgradeAmount] = useState(0);
  const [tierInfoModalOpen, setTierInfoModalOpen] = useState(false);
  const [tierInfoClickedAmount, setTierInfoClickedAmount] = useState(0);
  const [checkoutConfirmModalOpen, setCheckoutConfirmModalOpen] = useState(false);
  const [downgradeWarningOpen, setDowngradeWarningOpen] = useState(false);
  const [pendingDowngradeAmount, setPendingDowngradeAmount] = useState(0);
  const [quickReferenceOpen, setQuickReferenceOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { ok: stripeHealthy, missing, loading: stripeLoading } = useStripeHealth();
  const featureTableRef = useRef<HTMLDivElement>(null);
  const analyticsDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const previousTierRef = useRef<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    loadUserData();

    // Check for success parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setSuccess(true);
      setCelebrationType('success');
      setShowCelebration(true);
      const amount = urlParams.get('amount');
      if (amount) {
        setSelectedAmount(parseInt(amount));
      }
    }

    // Track page view
    saveplus_audit_event('pricing_page_viewed', {
      route: location.pathname,
    });

    // Scroll listener for sticky button
    const handleScroll = () => {
      if (featureTableRef.current) {
        const rect = featureTableRef.current.getBoundingClientRect();
        setShowStickyButton(rect.top < -100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const loadUserData = async () => {
    setDataLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        // Load current subscription
        const { data } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setCurrentSubscription(data);
          setSelectedAmount(data.subscription_amount);
        }
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSliderChange = useCallback((value: number) => {
    const previousAmount = selectedAmount;
    
    // Check for downgrade - show warning if user has current subscription and is moving down
    if (currentSubscription && value < currentSubscription.subscription_amount) {
      setPendingDowngradeAmount(value);
      setDowngradeWarningOpen(true);
      return; // Don't update immediately, wait for confirmation
    }
    
    setSelectedAmount(value);
    
    // Debounce analytics - only fire when user stops moving slider
    if (analyticsDebounceTimer.current) {
      clearTimeout(analyticsDebounceTimer.current);
    }
    
    analyticsDebounceTimer.current = setTimeout(() => {
      saveplus_audit_event('pricing_slider_moved', {
        amount: value,
        previous_amount: previousAmount,
        route: location.pathname,
      });
    }, 500);
    
    // Smart auto-scroll: only on tier boundary crosses
    const currentTier = getTierForAmount(value).name;
    const previousTier = previousTierRef.current || getTierForAmount(previousAmount).name;
    
    // Trigger celebration on tier upgrade
    if (currentTier !== previousTier && value > previousAmount && previousTierRef.current !== null) {
      setCelebrationType('tier-unlock');
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    
    // Check if user has scrolled to features in this session
    const hasScrolled = sessionStorage.getItem('pricing_features_viewed');
    
    if (currentTier !== previousTier && !hasScrolled) {
      setTimeout(() => {
        featureTableRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
        sessionStorage.setItem('pricing_features_viewed', 'true');
      }, 100);
    }
    
    previousTierRef.current = currentTier;
  }, [selectedAmount, currentSubscription, location.pathname]);

  const handleTierBadgeClick = useCallback((amount: number) => {
    saveplus_audit_event('pricing_tier_badge_clicked', {
      current_amount: selectedAmount,
      target_amount: amount,
      route: location.pathname,
    });

    if (amount > selectedAmount) {
      setTargetUpgradeAmount(amount);
      setUpgradeModalOpen(true);
    } else {
      // Current tier or downgrade
      setTierInfoClickedAmount(amount);
      setTierInfoModalOpen(true);
    }
  }, [selectedAmount, location.pathname]);

  const handleUpgradeConfirm = useCallback(() => {
    setSelectedAmount(targetUpgradeAmount);
    setUpgradeModalOpen(false);
    
    saveplus_audit_event('pricing_upgrade_confirmed', {
      previous_amount: selectedAmount,
      new_amount: targetUpgradeAmount,
      route: location.pathname,
    });
  }, [targetUpgradeAmount, selectedAmount, location.pathname]);

  const handleTierInfoDowngrade = useCallback(() => {
    setSelectedAmount(tierInfoClickedAmount);
    setTierInfoModalOpen(false);
    
    saveplus_audit_event('pricing_downgrade_confirmed', {
      previous_amount: selectedAmount,
      new_amount: tierInfoClickedAmount,
      route: location.pathname,
    });
  }, [tierInfoClickedAmount, selectedAmount, location.pathname]);

  const handleDowngradeConfirm = useCallback(() => {
    setSelectedAmount(pendingDowngradeAmount);
    setDowngradeWarningOpen(false);
    
    saveplus_audit_event('pricing_downgrade_confirmed_via_slider', {
      previous_amount: selectedAmount,
      new_amount: pendingDowngradeAmount,
      route: location.pathname,
    });
  }, [pendingDowngradeAmount, selectedAmount, location.pathname]);

  const handleDowngradeCancel = useCallback(() => {
    setDowngradeWarningOpen(false);
    setPendingDowngradeAmount(0);
  }, []);

  const handleInitiateCheckout = () => {
    console.log('[Pricing] Button clicked:', { 
      selectedAmount, 
      user: !!user, 
      loading, 
      dataLoading,
      currentSubscription,
      isCheckoutDisabled,
      stripeLoading
    });
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue.",
        variant: "destructive",
      });
      navigate('/auth', { state: { returnTo: '/pricing' } });
      return;
    }

    if (selectedAmount === 0) {
      // Free plan - no confirmation needed, process directly
      handleConfirmPlan();
    } else {
      // Paid plan - show confirmation modal
      setCheckoutConfirmModalOpen(true);
      
      saveplus_audit_event('pricing_checkout_confirmation_shown', {
        amount: selectedAmount,
        route: location.pathname,
      });
    }
  };

  const handleConfirmPlan = async () => {
    setCheckoutConfirmModalOpen(false);
    setLoading(true);

    try {
      saveplus_audit_event('pricing_plan_confirm_started', {
        amount: selectedAmount,
        route: location.pathname,
      });

      if (selectedAmount === 0) {
        // Free plan - handle locally
        await supabase.from('user_subscriptions').upsert({
          user_id: user.id,
          subscription_amount: 0,
          status: 'active',
        });

        setSuccess(true);
        setCelebrationType('success');
        setShowCelebration(true);
        await loadUserData();

        saveplus_audit_event('pricing_plan_confirmed', {
          amount: 0,
          plan_type: 'free',
          route: location.pathname,
        });
      } else {
        // Paid plan - call edge function to create checkout session
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            monthly_usd: selectedAmount,
            success_url: `${window.location.origin}/pricing?success=true&amount=${selectedAmount}`,
            cancel_url: `${window.location.origin}/pricing`,
          },
        });

        if (error) throw error;

        if (data.success) {
          saveplus_audit_event('pricing_checkout_redirect', {
            amount: selectedAmount,
            route: location.pathname,
          });
          window.location.href = data.url;
        } else {
          throw new Error(data.message || "Failed to create checkout session");
        }
      }
    } catch (error) {
      console.error("Plan confirmation error:", error);
      toast({
        title: "Error",
        description: "Failed to update plan. Please try again.",
        variant: "destructive",
      });

      saveplus_audit_event('pricing_plan_confirm_error', {
        amount: selectedAmount,
        error: error.message,
        route: location.pathname,
      });
    } finally {
      setLoading(false);
    }
  };


  const scrollToComparison = () => {
    featureTableRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
    saveplus_audit_event('pricing_view_comparison_clicked', {
      route: location.pathname,
    });
  };

  const isCheckoutDisabled = selectedAmount > 0 && stripeHealthy === false;

  // Loading skeleton
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-8 w-2/3 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </CardContent>
            </Card>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background Constellation */}
      <Suspense fallback={null}>
        <LazyPricingConstellation />
      </Suspense>

      {/* Celebration System */}
      <CelebrationSystem
        show={showCelebration}
        type={celebrationType}
        onComplete={() => setShowCelebration(false)}
      />

      {/* AI Pricing Chatbot */}
      <Suspense fallback={null}>
        <LazyPricingChatbot />
      </Suspense>

      {/* Real-Time Activity Feed */}
      <Suspense fallback={null}>
        <LazyRealTimeActivityFeed />
      </Suspense>
      
      {/* Sticky View Comparison Button */}
      {showStickyButton && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <Button
            onClick={scrollToComparison}
            size="lg"
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <List className="w-4 h-4 mr-2" />
            View Full Comparison
          </Button>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Stripe Health Banner */}
          {stripeHealthy === false && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-destructive">Billing Not Ready</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      We're waiting on Stripe configuration. Missing: {missing.join(', ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Header */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center backdrop-blur-sm bg-background/95">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <motion.h1
                    className="text-3xl font-bold"
                    animate={!prefersReducedMotion ? {
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    } : {}}
                    transition={{ duration: 5, repeat: Infinity }}
                    style={{
                      background: 'linear-gradient(90deg, hsl(var(--foreground)), hsl(var(--primary)), hsl(var(--foreground)))',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Pay What You Want
                  </motion.h1>
                  <button 
                    onClick={() => handleTierBadgeClick(selectedAmount)}
                    className={`focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg transition-transform duration-300 ${
                      prefersReducedMotion ? '' : 'hover:scale-110'
                    }`}
                  >
                    <TierBadge amount={selectedAmount} size="lg" />
                  </button>
                </div>
                <p className="text-muted-foreground mb-2">
                  Support $ave+ and unlock features as you go. Every dollar unlocks one feature.
                </p>
                <TierBadge amount={selectedAmount} showDescription size="sm" />
                {success && (
                  <motion.div
                    className="mt-4 p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    🎉 Plan updated successfully! Your new features are now available.
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Scrolling Stats Ticker */}
          <ScrollingTicker />

          {/* AI Price Recommender */}
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <LazyAIPriceRecommender
              currentAmount={selectedAmount}
              onApplyRecommendation={(amount) => {
                setSelectedAmount(amount);
                saveplus_audit_event('ai_recommendation_applied', {
                  previous_amount: selectedAmount,
                  recommended_amount: amount,
                  route: location.pathname,
                });
              }}
            />
          </Suspense>

          {/* 3D Interactive Disc & Holographic Value Card */}
          <div className="grid md:grid-cols-2 gap-6">
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <LazyPricing3DDisc
                selectedAmount={selectedAmount}
                onSelectAmount={handleSliderChange}
              />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <LazyHolographicValueCard selectedAmount={selectedAmount} />
            </Suspense>
          </div>

          {/* Live Savings Counter */}
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <LazyLiveSavingsCounter />
          </Suspense>

          {/* VALUE CARDS */}
          <StaggeredContainer className="space-y-6">
            {currentSubscription && (
              <StaggeredItem>
                <ValueEarnedCard
                  userId={user.id}
                  currentMonthlyContribution={currentSubscription.subscription_amount || 0}
                  projectedTier={selectedAmount}
                />
              </StaggeredItem>
            )}
            
            {/* PROJECTED SAVINGS CALCULATOR */}
            <StaggeredItem>
              <ProjectedSavingsCard selectedAmount={selectedAmount} />
            </StaggeredItem>

            {/* Current Plan */}
            {currentSubscription && (
              <StaggeredItem>
                <motion.div
                  whileHover={!prefersReducedMotion ? { scale: 1.02 } : {}}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Card className="bg-primary/5 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-5 h-5 text-primary" />
                          <span className="font-medium">
                            Current Plan: ${currentSubscription.subscription_amount}/month
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {currentSubscription.subscription_amount} feature{currentSubscription.subscription_amount === 1 ? '' : 's'} unlocked
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggeredItem>
            )}

            {/* Slider */}
            <StaggeredItem>
              <Card className="backdrop-blur-sm bg-background/95">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">
                      Choose Your Monthly Support
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Move the slider to choose your monthly price. Each dollar unlocks one feature.
                      Use arrow keys for precise control.
                    </p>
                  </div>

                  {/* Tier Preview Bar */}
                  <TierPreviewBar selectedAmount={selectedAmount} />

                  <EnhancedPricingSlider
                    value={selectedAmount}
                    onChange={handleSliderChange}
                    min={0}
                    max={20}
                    step={1}
                  />

                  <div className="mt-6">
                    <Button
                      type="button"
                      onClick={handleInitiateCheckout}
                      disabled={
                        selectedAmount === 0 
                          ? (loading || dataLoading)
                          : (loading || dataLoading || isCheckoutDisabled || stripeLoading)
                      }
                      className={`relative z-10 w-full py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 ${
                        !loading && !dataLoading && selectedAmount === 0 
                          ? 'cursor-pointer hover:opacity-90' 
                          : ''
                      }`}
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          {selectedAmount === 0 ? (
                            <div className="flex flex-col items-center gap-1">
                              <span>Get Started Free</span>
                              <span className="text-xs text-muted-foreground">No credit card required</span>
                            </div>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5" />
                              <span>Subscribe for ${selectedAmount}/month</span>
                            </>
                          )}
                        </>
                      )}
                    </Button>

                    <div className="mt-2 text-center" role="status" aria-live="polite">
                      {selectedAmount === 0 && currentSubscription?.subscription_amount === 0 && currentSubscription?.status === 'active' ? (
                        <p className="text-sm text-muted-foreground">
                          ✓ You're on the Free Plan
                        </p>
                      ) : selectedAmount === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Start saving today with 3 free features including basic analytics and AI insights
                        </p>
                      ) : stripeHealthy === false ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-destructive">
                          <AlertTriangle className="w-4 h-4" />
                          <p>Payment processing temporarily unavailable. Try again or select Free Plan.</p>
                        </div>
                      ) : selectedAmount === currentSubscription?.subscription_amount ? (
                        <p className="text-sm text-muted-foreground">
                          This is your current plan
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                      {selectedAmount === 0 ? (
                        <>
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Free forever
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            No credit card
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            14-day free trial
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Cancel anytime
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggeredItem>
          </StaggeredContainer>

          {/* Feature Comparison Table - PRIMARY DISPLAY */}
          <div ref={featureTableRef}>
            <AnimatedFeatureTable selectedAmount={selectedAmount} />
          </div>

          {/* Quick Reference - Collapsible Compact View */}
          <Card className={prefersReducedMotion ? '' : 'animate-fade-in'}>
            <CardContent className="p-6">
              <button
                onClick={() => {
                  setQuickReferenceOpen(!quickReferenceOpen);
                  saveplus_audit_event('pricing_quick_reference_toggled', {
                    is_open: !quickReferenceOpen,
                    route: location.pathname,
                  });
                }}
                className="w-full flex items-center justify-between text-left group"
              >
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <List className="w-5 h-5 text-primary" />
                    Quick Reference
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your selected features ({selectedAmount}/{FREEMIUM_FEATURE_ORDER.length})
                  </p>
                </div>
                {quickReferenceOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </button>

              {quickReferenceOpen && (
                <div className={`mt-4 space-y-3 max-h-96 overflow-y-auto ${
                  prefersReducedMotion ? '' : 'animate-accordion-down'
                }`}>
                  {FREEMIUM_FEATURE_ORDER.map((feature, index) => (
                    <FeatureItem
                      key={feature.key}
                      feature={feature}
                      isUnlocked={index < selectedAmount}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                Questions? <a href="/help" className="text-primary hover:underline">Contact support</a> or
                visit our <a href="/docs" className="text-primary hover:underline">documentation</a>.
              </p>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Can I change my subscription amount?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can adjust your subscription amount at any time. Changes take effect at the next billing cycle.
                    Upgrades grant immediate access to new features.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>What happens if I downgrade?</AccordionTrigger>
                  <AccordionContent>
                    When you downgrade, you'll keep access to your current features until the end of your billing period.
                    After that, your account will reflect the new tier's limitations.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Is there a minimum commitment?</AccordionTrigger>
                  <AccordionContent>
                    No! There's no minimum commitment. You can start with $1/month or even stay on the free plan forever.
                    Cancel anytime without penalty.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>How does the 14-day free trial work?</AccordionTrigger>
                  <AccordionContent>
                    All paid plans include a 14-day free trial. You won't be charged until the trial ends.
                    You can cancel before the trial expires and won't pay anything.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                  <AccordionContent>
                    We accept all major credit cards, debit cards, and digital wallets through our secure payment processor, Stripe.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Tier Upgrade Modal */}
      <TierUpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        currentAmount={currentSubscription?.subscription_amount || 0}
        targetAmount={targetUpgradeAmount}
        onConfirm={handleUpgradeConfirm}
      />

      {/* Tier Info Modal (Current/Downgrade) */}
      <TierInfoModal
        open={tierInfoModalOpen}
        onOpenChange={setTierInfoModalOpen}
        currentAmount={currentSubscription?.subscription_amount || 0}
        clickedAmount={tierInfoClickedAmount}
        onDowngrade={handleTierInfoDowngrade}
      />

      {/* Checkout Confirmation Modal */}
      <CheckoutConfirmationModal
        open={checkoutConfirmModalOpen}
        onOpenChange={setCheckoutConfirmModalOpen}
        selectedAmount={selectedAmount}
        currentAmount={currentSubscription?.subscription_amount || 0}
        onConfirm={handleConfirmPlan}
        loading={loading}
      />

      {/* Downgrade Warning Modal */}
      <DowngradeWarningModal
        open={downgradeWarningOpen}
        onClose={handleDowngradeCancel}
        onConfirm={handleDowngradeConfirm}
        currentAmount={currentSubscription?.subscription_amount || 0}
        targetAmount={pendingDowngradeAmount}
      />
    </div>
  );
}
