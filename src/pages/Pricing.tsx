import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackSubscriptionEvent } from "@/lib/subscription-analytics";
import { saveplus_audit_event } from "@/lib/analytics";
import { FREEMIUM_FEATURE_ORDER } from "@/lib/constants";
import { 
  AlertTriangle,
  CreditCard,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useStripeHealth } from "@/hooks/useStripeHealth";
import AccessibleSlider from "@/components/pricing/AccessibleSlider";
import FeatureItem from "@/components/pricing/FeatureItem";
import ValueEarnedCard from "@/components/pricing/ValueEarnedCard";
import ProjectedSavingsCard from "@/components/pricing/ProjectedSavingsCard";
import TierBadge, { getTierForAmount } from "@/components/pricing/TierBadge";
import FeatureComparisonTable from "@/components/pricing/FeatureComparisonTable";
import TierUpgradeModal from "@/components/pricing/TierUpgradeModal";

export default function Pricing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [targetUpgradeAmount, setTargetUpgradeAmount] = useState(0);
  const { ok: stripeHealthy, missing, loading: stripeLoading } = useStripeHealth();
  const featureTableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserData();

    // Check for success parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setSuccess(true);
      const amount = urlParams.get('amount');
      if (amount) {
        setSelectedAmount(parseInt(amount));
      }
    }

    // Track page view
    saveplus_audit_event('pricing_page_viewed', {
      route: location.pathname,
    });
  }, [location.pathname]);

  const loadUserData = async () => {
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
    }
  };

  const handleSliderChange = useCallback((value: number) => {
    saveplus_audit_event('pricing_slider_moved', {
      amount: value,
      previous_amount: selectedAmount,
      route: location.pathname,
    });
    setSelectedAmount(value);
    
    // Smooth scroll to feature table
    setTimeout(() => {
      featureTableRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }, 100);
  }, [selectedAmount, location.pathname]);

  const handleTierBadgeClick = useCallback((amount: number) => {
    if (amount > selectedAmount) {
      setTargetUpgradeAmount(amount);
      setUpgradeModalOpen(true);
      
      saveplus_audit_event('pricing_tier_badge_clicked', {
        current_amount: selectedAmount,
        target_amount: amount,
        route: location.pathname,
      });
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

  const handleConfirmPlan = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue.",
        variant: "destructive",
      });
      navigate('/auth', { state: { returnTo: '/pricing' } });
      return;
    }

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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Choose Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Please log in to continue.</p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCheckoutDisabled = selectedAmount > 0 && stripeHealthy === false;

  return (
    <div className="min-h-screen bg-background">
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
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h1 className="text-3xl font-bold">Pay What You Want</h1>
                <button 
                  onClick={() => handleTierBadgeClick(selectedAmount)}
                  className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                >
                  <TierBadge amount={selectedAmount} size="lg" />
                </button>
              </div>
              <p className="text-muted-foreground mb-2">
                Support $ave+ and unlock features as you go. Every dollar unlocks one feature.
              </p>
              <TierBadge amount={selectedAmount} showDescription size="sm" />
              {success && (
                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg">
                  🎉 Plan updated successfully! Your new features are now available.
                </div>
              )}
            </CardContent>
          </Card>

          {/* VALUE CARDS */}
          {currentSubscription && (
            <ValueEarnedCard
              userId={user.id}
              currentMonthlyContribution={currentSubscription.subscription_amount || 0}
              projectedTier={selectedAmount}
            />
          )}
          
          {/* PROJECTED SAVINGS CALCULATOR */}
          <ProjectedSavingsCard selectedAmount={selectedAmount} />

          {/* Current Plan */}
          {currentSubscription && (
            <Card className="bg-primary/5">
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
          )}

          {/* Slider */}
          <Card>
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

              <AccessibleSlider
                value={selectedAmount}
                onChange={handleSliderChange}
                min={0}
                max={20}
                step={1}
              />

              <div className="mt-6">
                <Button
                  onClick={handleConfirmPlan}
                  disabled={loading || selectedAmount === currentSubscription?.subscription_amount || isCheckoutDisabled || stripeLoading}
                  className="w-full py-4 rounded-xl font-semibold flex items-center justify-center space-x-2"
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
                        <span>Confirm Free Plan</span>
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
                  {stripeHealthy === false && (
                    <p className="text-sm text-destructive">
                      Billing unavailable. Awaiting Stripe configuration.
                    </p>
                  )}
                  {selectedAmount === currentSubscription?.subscription_amount && (
                    <p className="text-sm text-muted-foreground">
                      This is your current plan
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    14-day free trial
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Cancel anytime
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Comparison Table */}
          <div ref={featureTableRef}>
            <FeatureComparisonTable selectedAmount={selectedAmount} />
          </div>

          {/* Features List - Compact View */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Your Selected Features ({selectedAmount}/{FREEMIUM_FEATURE_ORDER.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {FREEMIUM_FEATURE_ORDER.map((feature, index) => (
                  <FeatureItem
                    key={feature.key}
                    feature={feature}
                    isUnlocked={index < selectedAmount}
                    index={index}
                  />
                ))}
              </div>
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
    </div>
  );
}
