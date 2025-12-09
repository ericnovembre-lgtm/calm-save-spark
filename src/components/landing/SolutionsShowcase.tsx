import { motion } from "framer-motion";
import { useState } from "react";
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  Building2, 
  Crown,
  Check
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const solutions = [
  {
    id: "students",
    icon: GraduationCap,
    title: "Students",
    tagline: "Start your financial journey right",
    features: [
      "Student loan tracking",
      "Budget templates for campus life",
      "Part-time income management",
      "Financial literacy courses"
    ],
    metric: "Save $200+/month",
    color: "from-amber-500/10 to-yellow-500/10"
  },
  {
    id: "families",
    icon: Users,
    title: "Families",
    tagline: "Secure your family's future together",
    features: [
      "Joint budgets & shared goals",
      "Kids allowance management",
      "Family expense tracking",
      "College savings plans"
    ],
    metric: "$15K+ saved annually",
    color: "from-green-500/10 to-emerald-500/10"
  },
  {
    id: "freelancers",
    icon: Briefcase,
    title: "Freelancers",
    tagline: "Manage irregular income with ease",
    features: [
      "Income smoothing tools",
      "Tax document organization",
      "Client invoice tracking",
      "Expense categorization"
    ],
    metric: "30% better cash flow",
    color: "from-yellow-500/10 to-orange-500/10"
  },
  {
    id: "businesses",
    icon: Building2,
    title: "Small Businesses",
    tagline: "Financial OS for your business",
    features: [
      "Business account integration",
      "Expense management",
      "Cash flow forecasting",
      "QuickBooks sync"
    ],
    metric: "20 hours saved/month",
    color: "from-orange-500/10 to-amber-500/10"
  },
  {
    id: "high-net-worth",
    icon: Crown,
    title: "High Net Worth",
    tagline: "Sophisticated wealth management",
    features: [
      "Alternative investments tracking",
      "Multi-entity management",
      "Tax optimization",
      "Family office tools"
    ],
    metric: "$100K+ optimized",
    color: "from-amber-500/10 to-orange-500/10"
  }
];

export const SolutionsShowcase = () => {
  const [activeSolution, setActiveSolution] = useState("students");
  const prefersReducedMotion = useReducedMotion();
  
  const active = solutions.find(s => s.id === activeSolution) || solutions[0];
  const ActiveIcon = active.icon;

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for Your Life Stage
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tailored financial solutions for students, families, freelancers, businesses, and high net worth individuals
          </p>
        </motion.div>

        {/* Persona Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            const isActive = activeSolution === solution.id;
            
            return (
              <motion.button
                key={solution.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveSolution(solution.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-background text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{solution.title}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Active Solution Display */}
        <motion.div
          key={activeSolution}
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`max-w-4xl mx-auto p-8 md:p-12 rounded-3xl bg-gradient-to-br ${active.color} border border-border backdrop-blur-sm`}
        >
          <div className="flex items-start gap-6 mb-8">
            <div className="p-4 rounded-2xl bg-background/80 backdrop-blur">
              <ActiveIcon className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-2">{active.title}</h3>
              <p className="text-lg text-muted-foreground">{active.tagline}</p>
            </div>
            <div className="hidden md:block px-4 py-2 rounded-full bg-primary/20 backdrop-blur">
              <span className="text-sm font-bold text-primary">{active.metric}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {active.features.map((feature, i) => (
              <motion.div
                key={i}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-background/60 backdrop-blur"
              >
                <div className="p-1 rounded-full bg-primary/20">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>

          <div className="md:hidden mt-6 text-center">
            <span className="inline-block px-6 py-2 rounded-full bg-primary/20 backdrop-blur text-sm font-bold text-primary">
              {active.metric}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
