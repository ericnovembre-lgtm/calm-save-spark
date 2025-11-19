import { motion } from "framer-motion";
import { Quote, TrendingUp, Sparkles } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const cases = [
  {
    name: "Sarah M.",
    role: "Graduate Student",
    before: "$0 in savings",
    after: "$12,000 saved",
    timeframe: "18 months",
    story: "I was living paycheck to paycheck with student loans. $ave+ helped me automate savings and track every dollar. Now I have an emergency fund and I'm debt-free!",
    highlight: "Saved for emergency fund + paid off $8K in debt"
  },
  {
    name: "The Johnson Family",
    role: "Family of 4",
    before: "$3,200/month spending",
    after: "$2,400/month spending",
    timeframe: "8 months",
    story: "We had no idea where our money was going. The budget tools and family features helped us cut unnecessary spending and save for our kids' college funds.",
    highlight: "$9,600 saved annually + $15K in college fund"
  },
  {
    name: "Marcus T.",
    role: "Freelance Designer",
    before: "Inconsistent income stress",
    after: "3-month runway saved",
    timeframe: "12 months",
    story: "As a freelancer, cash flow was unpredictable. The income smoothing and automated savings during good months gave me peace of mind during slow periods.",
    highlight: "Built $18K emergency fund + improved credit by 80 points"
  }
];

export const UseCases = () => {
  const prefersReducedMotion = useReducedMotion();

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
            Real People, Real Results
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how $ave+ users transformed their financial lives
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {cases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group"
            >
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-muted/50 to-background border border-border hover:border-primary/50 transition-all h-full backdrop-blur-sm hover:shadow-xl">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-10">
                  <Quote className="w-16 h-16 text-primary" />
                </div>

                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{useCase.name}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.role}</p>
                </div>

                {/* Before/After Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-background/60 backdrop-blur">
                    <p className="text-xs text-muted-foreground mb-1">Before</p>
                    <p className="text-sm font-semibold">{useCase.before}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">After</p>
                    <p className="text-sm font-semibold text-primary">{useCase.after}</p>
                  </div>
                </div>

                {/* Story */}
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  "{useCase.story}"
                </p>

                {/* Highlight */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold">{useCase.highlight}</p>
                </div>

                {/* Timeframe Badge */}
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/60 backdrop-blur text-xs font-semibold">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  {useCase.timeframe}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            Join <span className="font-bold text-primary">250,000+</span> users who've improved their finances with $ave+
          </p>
        </motion.div>
      </div>
    </section>
  );
};
