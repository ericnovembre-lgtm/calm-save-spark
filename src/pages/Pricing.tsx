import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, 
  Sparkles, 
  TrendingUp, 
  Zap,
  Shield,
  ArrowRight,
  Info
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Complete feature mapping by price point
const FEATURE_MAP: Record<number, string[]> = {
  0: ["Up to 3 savings goals", "5 smart pots", "Basic round-up automation", "3.5% APY", "Mobile & web app", "Email support"],
  1: ["Up to 5 savings goals", "5 smart pots", "3.75% APY", "All free features"],
  2: ["Up to 5 goals", "10 smart pots", "Basic spending insights", "All previous features"],
  3: ["Up to 7 goals", "2 custom automation rules", "All previous features"],
  4: ["4.0% APY", "Export transactions (CSV)", "All previous features"],
  5: ["Up to 10 savings goals", "AI-powered savings tips", "All previous features"],
  6: ["15 smart pots", "Advanced analytics dashboard", "All previous features"],
  7: ["5 custom automation rules", "Goal milestones & celebrations", "All previous features"],
  8: ["Priority email support", "Weekly financial reports", "All previous features"],
  9: ["Unlimited savings goals", "4.15% APY", "All previous features"],
  10: ["Unlimited smart pots", "AI financial coach (10 chats/month)", "All previous features"],
  11: ["$ave+ Virtual Card", "1% cashback on purchases", "All previous features"],
  12: ["Advanced AI insights", "Predictive analytics", "All previous features"],
  13: ["Physical $ave+ Card", "1.5% cashback", "All previous features"],
  14: ["Priority phone support", "Early access to features", "All previous features"],
  15: ["4.25% APY", "Unlimited AI coach", "2% cashback", "Dedicated account manager", "API access"],
};

export default function Pricing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [isAnnual, setIsAnnual] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setIsAuthenticated(true);
      const { data } = await supabase
        .from('user_subscriptions')
        .select('subscription_amount')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setCurrentSubscription(data.subscription_amount);
        setSelectedAmount(data.subscription_amount);
      }
    }
  };

  const annualPrice = selectedAmount * 12 * 0.85;
  const savings = (selectedAmount * 12) - annualPrice;
  const displayPrice = isAnnual ? annualPrice : selectedAmount;

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnTo: '/checkout', amount: selectedAmount } });
      return;
    }

    if (selectedAmount === 0) {
      toast({
        title: 'Free Plan',
        description: 'You\'re already on the free plan! Upgrade anytime.',
      });
      return;
    }

    navigate('/checkout', { state: { amount: selectedAmount, billing: isAnnual ? 'annual' : 'monthly' } });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge className="mb-4 gap-1">
            <Sparkles className="w-3 h-3" />
            Flexible Pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Pay What You Want
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choose your subscription amount from $0-$15/month. Every dollar unlocks more powerful features. 
            No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Interactive Slider Section */}
        <div className="max-w-2xl mx-auto mb-16">
          {/* Amount Display */}
          <div className="text-center mb-8">
            <div className="text-7xl font-bold mb-2">
              ${isAnnual ? displayPrice.toFixed(2) : selectedAmount}
            </div>
            <div className="text-xl text-muted-foreground mb-3">
              per {isAnnual ? 'year' : 'month'}
            </div>
            {isAnnual && savings > 0 && (
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                Save ${savings.toFixed(2)}/year
              </Badge>
            )}
          </div>

          {/* Slider */}
          <div className="mb-8">
            <Slider
              value={[selectedAmount]}
              onValueChange={(v) => setSelectedAmount(v[0])}
              min={0}
              max={15}
              step={1}
              className="mb-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0/mo</span>
              <span>$15/mo</span>
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {[0, 3, 5, 7, 10, 15].map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedAmount(amount)}
              >
                ${amount}
              </Button>
            ))}
          </div>

          {/* Annual Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Label htmlFor="annual-toggle">Monthly</Label>
            <Switch 
              id="annual-toggle"
              checked={isAnnual} 
              onCheckedChange={setIsAnnual} 
            />
            <Label htmlFor="annual-toggle" className="flex items-center gap-1">
              Annual 
              <Badge variant="secondary" className="ml-1">Save 15%</Badge>
            </Label>
          </div>

          {/* CTA Button */}
          <Button 
            size="lg" 
            className="w-full gap-2"
            onClick={handleGetStarted}
          >
            {currentSubscription === selectedAmount 
              ? 'Current Plan' 
              : currentSubscription > 0 
                ? 'Change Plan' 
                : 'Get Started'}
            <ArrowRight className="w-5 h-5" />
          </Button>
          
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

        <Separator className="mb-16" />

        {/* Feature Breakdown Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {/* Current Plan Card */}
          {isAuthenticated && currentSubscription >= 0 && (
            <Card className="border-2">
              <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">Your Current Plan</Badge>
                <CardTitle>
                  ${currentSubscription}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {FEATURE_MAP[currentSubscription]?.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Selected Amount Card */}
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader>
              <Badge className="w-fit mb-2 gap-1">
                <Sparkles className="w-3 h-3" />
                Selected
              </Badge>
              <CardTitle>
                ${selectedAmount}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {FEATURE_MAP[selectedAmount]?.slice(0, 5).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Max Plan Card */}
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2 gap-1">
                <TrendingUp className="w-3 h-3" />
                Maximum
              </Badge>
              <CardTitle>
                $15
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {FEATURE_MAP[15].slice(0, 5).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
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
        </div>
      </div>
    </div>
  );
}
