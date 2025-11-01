import { useState } from "react";
import { Check, X, Sparkles, Shield, Zap, TrendingUp, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SaveplusAnimIcon } from "@/components/icons";

/**
 * Pricing page - Beautiful three-tier pricing with annual/monthly toggle
 * SEO optimized for pricing and plans
 */
const Pricing = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started",
      price: { monthly: 0, annual: 0 },
      icon: Sparkles,
      features: [
        { name: "Up to 3 savings goals", included: true },
        { name: "5 smart pots", included: true },
        { name: "Basic automation (round-ups)", included: true },
        { name: "3.5% APY savings rate", included: true },
        { name: "Mobile & web app", included: true },
        { name: "Email support", included: true },
        { name: "Advanced automation", included: false },
        { name: "AI insights", included: false },
        { name: "$ave+ Card", included: false },
        { name: "Priority support", included: false },
      ],
      cta: "Get Started",
      ctaVariant: "neutral" as const,
      popular: false,
    },
    {
      name: "Plus",
      description: "For committed savers",
      price: { monthly: 4.99, annual: 49.99 },
      icon: Zap,
      features: [
        { name: "Up to 10 savings goals", included: true },
        { name: "15 smart pots", included: true },
        { name: "Advanced automation & rules", included: true },
        { name: "4.0% APY savings rate", included: true },
        { name: "Mobile & web app", included: true },
        { name: "Email support", included: true },
        { name: "Basic AI insights", included: true },
        { name: "Export & analytics", included: true },
        { name: "$ave+ Card", included: false },
        { name: "Priority support", included: false },
      ],
      cta: "Start Free Trial",
      ctaVariant: "default" as const,
      popular: true,
    },
    {
      name: "Pro",
      description: "For power savers",
      price: { monthly: 9.99, annual: 99.99 },
      icon: TrendingUp,
      features: [
        { name: "Unlimited savings goals", included: true },
        { name: "Unlimited smart pots", included: true },
        { name: "Advanced automation & rules", included: true },
        { name: "4.25% APY savings rate", included: true },
        { name: "Mobile & web app", included: true },
        { name: "Priority support", included: true },
        { name: "AI-powered financial insights", included: true },
        { name: "Export & analytics", included: true },
        { name: "$ave+ Card with cashback", included: true },
        { name: "Early access to features", included: true },
      ],
      cta: "Start Free Trial",
      ctaVariant: "primary" as const,
      popular: false,
    },
  ];

  const calculateSavings = (plan: typeof plans[0]) => {
    if (plan.price.monthly === 0) return 0;
    const yearlyTotal = plan.price.monthly * 12;
    const savings = yearlyTotal - plan.price.annual;
    return Math.round(savings);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const MotionDiv = prefersReducedMotion ? 'div' : motion.div;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/20 to-background pt-16 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <MotionDiv
            className="text-center"
            {...(!prefersReducedMotion && {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.5 },
            })}
          >
            <Link to="/welcome" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <SaveplusAnimIcon name="logo" size={20} decorative />
              <span>← Back to Home</span>
            </Link>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Start free, upgrade when you're ready. No hidden fees, cancel anytime.
            </p>

            {/* Annual/Monthly Toggle */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Label htmlFor="billing-toggle" className={!isAnnual ? 'font-semibold' : ''}>
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                aria-label="Toggle annual billing"
              />
              <Label htmlFor="billing-toggle" className={isAnnual ? 'font-semibold' : ''}>
                Annual
              </Label>
              {isAnnual && (
                <Badge variant="default" className="ml-2">
                  Save up to 17%
                </Badge>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>FDIC Insured</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>14-day Free Trial</span>
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <MotionDiv
            className="grid md:grid-cols-3 gap-6 lg:gap-8"
            {...(!prefersReducedMotion && {
              variants: containerVariants,
              initial: "hidden",
              animate: "visible",
            })}
          >
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = isAnnual ? plan.price.annual : plan.price.monthly;
              const displayPrice = price === 0 ? 0 : isAnnual ? (price / 12).toFixed(2) : price.toFixed(2);
              const savings = calculateSavings(plan);

              return (
                <MotionDiv
                  key={plan.name}
                  {...(!prefersReducedMotion && { variants: itemVariants })}
                >
                  <Card
                    className={`relative h-full flex flex-col transition-all duration-300 hover:shadow-xl ${
                      plan.popular ? 'border-primary shadow-lg scale-105' : ''
                    }`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                        Most Popular
                      </Badge>
                    )}

                    <CardHeader className="text-center pb-6">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>

                      <div className="mt-6">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold">${displayPrice}</span>
                          <span className="text-muted-foreground">
                            {price === 0 ? '/forever' : '/month'}
                          </span>
                        </div>
                        {isAnnual && savings > 0 && (
                          <p className="text-xs text-primary mt-2">
                            Save ${savings}/year
                          </p>
                        )}
                        {isAnnual && price > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Billed annually at ${price}
                          </p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      <Link to="/auth" className="w-full mb-6">
                        <Button
                          variant={plan.ctaVariant}
                          className="w-full group"
                          size="lg"
                        >
                          {plan.cta}
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>

                      {plan.price.monthly > 0 && (
                        <p className="text-xs text-muted-foreground text-center mb-6">
                          14-day free trial • Cancel anytime
                        </p>
                      )}

                      <div className="space-y-3 flex-1">
                        <p className="text-sm font-semibold mb-3">What's included:</p>
                        {plan.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3"
                          >
                            {feature.included ? (
                              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                            )}
                            <span
                              className={
                                feature.included
                                  ? 'text-sm'
                                  : 'text-sm text-muted-foreground/70 line-through'
                              }
                            >
                              {feature.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </MotionDiv>
              );
            })}
          </MotionDiv>

          {/* Feature Comparison Table */}
          <div className="mt-16 sm:mt-24">
            <h2 className="text-3xl font-bold text-center mb-8">
              Compare All Features
            </h2>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold min-w-[200px]">
                        Feature
                      </th>
                      {plans.map((plan) => (
                        <th
                          key={plan.name}
                          className="text-center p-4 font-semibold min-w-[120px]"
                        >
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plans[0].features.map((_, featureIdx) => (
                      <tr key={featureIdx} className="border-b last:border-0">
                        <td className="p-4 text-sm">
                          {plans[0].features[featureIdx].name}
                        </td>
                        {plans.map((plan) => (
                          <td key={plan.name} className="p-4 text-center">
                            {plan.features[featureIdx].included ? (
                              <Check className="w-5 h-5 text-primary mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 bg-accent/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <MotionDiv
            className="text-center mb-12"
            {...(!prefersReducedMotion && {
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
            })}
          >
            <h2 className="text-3xl font-bold mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about pricing
            </p>
          </MotionDiv>

          <div className="grid gap-4">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes! You can cancel your subscription at any time. Your account will remain active until the end of your billing period, and you can always downgrade to the free plan.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards. Payments are processed securely through Stripe, and we never store your card details.",
              },
              {
                q: "Is my money FDIC insured?",
                a: "Yes! All deposits are FDIC insured up to $250,000 through our partner banks. Your money is safe, secure, and always accessible.",
              },
              {
                q: "How does the free trial work?",
                a: "Start any paid plan with a 14-day free trial. You won't be charged until the trial ends, and you can cancel anytime during the trial period with no charges.",
              },
              {
                q: "Can I switch plans later?",
                a: "Absolutely! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the end of your billing period.",
              },
              {
                q: "What happens if I exceed my plan limits?",
                a: "We'll notify you when you're approaching your limits. You can either upgrade to a higher plan or remove some items to stay within your current plan.",
              },
            ].map((faq, idx) => (
              <MotionDiv
                key={idx}
                {...(!prefersReducedMotion && {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { delay: idx * 0.1 },
                })}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <MotionDiv
            className="text-center"
            {...(!prefersReducedMotion && {
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
            })}
          >
            <Card className="bg-gradient-to-br from-primary/10 via-accent to-background border-primary/20">
              <CardContent className="p-8 sm:p-12">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to start saving smarter?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of users who are automating their savings and hitting their financial goals with $ave+.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth">
                    <Button size="lg" className="w-full sm:w-auto group">
                      Get Started Free
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/welcome">
                    <Button variant="neutral" size="lg" className="w-full sm:w-auto">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
