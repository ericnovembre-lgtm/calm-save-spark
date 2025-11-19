import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Building2, 
  TrendingUp, 
  BarChart3,
  FileText,
  Gamepad2,
  Calendar,
  Home,
  Bitcoin
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const premiumFeatures = [
  {
    icon: TrendingUp,
    title: "Alternatives Portal",
    description: "Access private equity, hedge funds, and alternative investments",
    path: "/alternatives-portal",
    badge: "High Net Worth"
  },
  {
    icon: Building2,
    title: "Family Office",
    description: "Multi-generational wealth management and estate planning",
    path: "/family-office",
    badge: "Ultra Premium"
  },
  {
    icon: BarChart3,
    title: "Investment Manager",
    description: "Advanced portfolio analytics and rebalancing automation",
    path: "/investment-manager",
    badge: "Pro"
  },
  {
    icon: Gamepad2,
    title: "LifeSim",
    description: "Simulate major life decisions and their financial impact",
    path: "/lifesim",
    badge: "New"
  },
  {
    icon: Calendar,
    title: "Life Planner",
    description: "30-year financial roadmap with milestone tracking",
    path: "/life-planner",
    badge: "Pro"
  },
  {
    icon: Home,
    title: "Refinancing Hub",
    description: "Optimize mortgages, auto loans, and student debt",
    path: "/refinancing-hub",
    badge: "Pro"
  },
  {
    icon: Bitcoin,
    title: "DeFi Manager",
    description: "Track and manage decentralized finance investments",
    path: "/defi-manager",
    badge: "Advanced"
  },
  {
    icon: FileText,
    title: "Tax Documents",
    description: "Automated tax prep and document organization",
    path: "/tax-documents",
    badge: "Pro"
  },
  {
    icon: Sparkles,
    title: "Corporate Wellness",
    description: "Enterprise financial wellness programs for teams",
    path: "/corporate-wellness",
    badge: "Enterprise"
  }
];

export const PremiumShowcase = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Premium Features</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Advanced Financial Solutions
            <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              For Serious Wealth Builders
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Go beyond basics with sophisticated tools for investment management, tax optimization, and wealth planning
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {premiumFeatures.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={feature.title}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={prefersReducedMotion ? {} : { y: -4, scale: 1.02 }}
                onClick={() => navigate(feature.path)}
                className="group cursor-pointer"
              >
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-background to-muted/50 border border-border hover:border-primary/50 transition-all h-full backdrop-blur-sm hover:shadow-xl">
                  {/* Premium Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur text-primary border border-primary/30">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 w-fit">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>

                  {/* Hover Effect Line */}
                  <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary to-accent transition-all duration-300" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={() => navigate("/pricing")}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg transition-all"
          >
            View Premium Plans
          </button>
        </motion.div>
      </div>
    </section>
  );
};
