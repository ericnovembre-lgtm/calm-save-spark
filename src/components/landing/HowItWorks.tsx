import { motion } from "framer-motion";
import { UserPlus, Link2, Target, Zap, ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up Free",
    description: "Create your account in 60 seconds. No credit card required.",
    details: "Choose from email, Google, or phone sign-up. Encrypted and secure.",
    time: "< 1 min"
  },
  {
    icon: Link2,
    title: "Connect Accounts",
    description: "Link your bank accounts securely via Plaid integration.",
    details: "We support 10,000+ financial institutions. Bank-level 256-bit encryption.",
    time: "2-3 mins"
  },
  {
    icon: Target,
    title: "Set Goals",
    description: "Define your financial goals and let AI create your plan.",
    details: "Emergency fund, vacation, house down payment, retirement—you name it.",
    time: "5 mins"
  },
  {
    icon: Zap,
    title: "Automate & Grow",
    description: "Turn on automations and watch your savings grow.",
    details: "Round-ups, scheduled transfers, smart rules—all working in the background.",
    time: "Ongoing"
  }
];

export const HowItWorks = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From sign-up to automated savings in just 4 simple steps
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Progress Line */}
            <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                
                return (
                  <motion.div
                    key={index}
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                    whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    className="relative"
                  >
                    <div className="text-center">
                      {/* Step Number & Icon */}
                      <div className="relative inline-block mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur border border-primary/30 relative z-10">
                          <Icon className="w-9 h-9 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg z-20">
                          {index + 1}
                        </div>
                      </div>

                      {/* Time Badge */}
                      <div className="inline-block px-3 py-1 rounded-full bg-background text-xs font-semibold text-muted-foreground mb-3 border border-border">
                        {step.time}
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground mb-3">{step.description}</p>
                      <p className="text-sm text-muted-foreground/70">{step.details}</p>
                    </div>

                    {/* Arrow (desktop only) */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-20 -right-4 z-20">
                        <ArrowRight className="w-6 h-6 text-primary/50" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur border border-primary/20">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-semibold">
              Most users complete onboarding in under 10 minutes
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
