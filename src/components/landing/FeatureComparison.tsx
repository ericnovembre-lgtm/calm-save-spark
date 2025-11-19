import { motion } from "framer-motion";
import { Check, X, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { memo, useCallback, useMemo } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    popular: false,
    features: [
      { name: "Up to 3 connected accounts", included: true },
      { name: "Basic budgeting tools", included: true },
      { name: "Transaction tracking", included: true },
      { name: "1 savings goal", included: true },
      { name: "Mobile app access", included: true },
      { name: "AI Coach (5 msgs/month)", included: true },
      { name: "Multiple goals", included: false },
      { name: "Advanced AI agents", included: false },
      { name: "Investment tracking", included: false },
      { name: "Priority support", included: false }
    ]
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "Most popular for serious savers",
    popular: true,
    features: [
      { name: "Unlimited connected accounts", included: true },
      { name: "Advanced budgeting & analytics", included: true },
      { name: "Unlimited savings goals", included: true },
      { name: "Investment tracking", included: true },
      { name: "All 7 AI specialists", included: true },
      { name: "Digital Twin forecasting", included: true },
      { name: "Credit score monitoring", included: true },
      { name: "Tax document organization", included: true },
      { name: "Priority support", included: true },
      { name: "Premium features", included: false }
    ]
  },
  {
    name: "Business",
    price: "$29.99",
    period: "/month",
    description: "For freelancers & businesses",
    popular: false,
    features: [
      { name: "Everything in Pro", included: true },
      { name: "Business expense tracking", included: true },
      { name: "Multi-entity management", included: true },
      { name: "QuickBooks integration", included: true },
      { name: "Income stream analytics", included: true },
      { name: "Tax optimization tools", included: true },
      { name: "Team collaboration", included: true },
      { name: "API access", included: true },
      { name: "Dedicated support", included: true },
      { name: "Family Office features", included: true }
    ]
  }
];

export const FeatureComparison = memo(() => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const handleNavigate = useCallback(() => {
    navigate('/pricing');
  }, [navigate]);

  const tierCards = useMemo(() => 
    tiers.map((tier, index) => (
      <motion.div
        key={tier.name}
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
        whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="relative"
      >
        <div
          className={`relative p-8 rounded-3xl h-full transition-all ${
            tier.popular
              ? "bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary shadow-xl scale-105"
              : "bg-muted/50 border border-border hover:border-primary/50"
          }`}
        >
          {tier.popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg">
                <Star className="w-4 h-4 fill-current" />
                Most Popular
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">{tier.description}</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold">{tier.price}</span>
              {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            {tier.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                {feature.included ? (
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}
                <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleNavigate}
            className={`w-full py-4 rounded-full font-semibold transition-all ${
              tier.popular
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                : "bg-background border border-border hover:border-primary hover:bg-primary/5"
            }`}
          >
            {tier.price === "$0" ? "Start Free" : "Get Started"}
          </button>
        </div>
      </motion.div>
    )),
    [prefersReducedMotion, handleNavigate]
  );

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tierCards}
        </div>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            All plans include bank-level security • No credit card required for Free plan • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
});
