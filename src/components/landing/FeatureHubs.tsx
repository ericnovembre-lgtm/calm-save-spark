import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { memo, useCallback, useMemo } from "react";
import { 
  Wallet, 
  TrendingUp, 
  Brain, 
  Users, 
  Sparkles,
  ArrowRight 
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const hubs = [
  {
    id: "manage-money",
    icon: Wallet,
    title: "Manage Money",
    description: "Complete control over your finances",
    featureCount: 8,
    features: ["Smart Budgets", "Transaction Tracking", "Bill Management"],
    color: "from-blue-500/20 to-cyan-500/20",
    path: "/hubs/manage-money"
  },
  {
    id: "grow-wealth",
    icon: TrendingUp,
    title: "Grow Wealth",
    description: "Build your financial future",
    featureCount: 6,
    features: ["Goal Tracking", "Investment Tools", "Credit Builder"],
    color: "from-green-500/20 to-emerald-500/20",
    path: "/hubs/grow-wealth"
  },
  {
    id: "ai-insights",
    icon: Brain,
    title: "AI & Insights",
    description: "Intelligent financial guidance",
    featureCount: 7,
    features: ["AI Coach", "Digital Twin", "Smart Analytics"],
    color: "from-purple-500/20 to-pink-500/20",
    path: "/hubs/ai-insights"
  },
  {
    id: "lifestyle",
    icon: Users,
    title: "Lifestyle",
    description: "Tailored for your life stage",
    featureCount: 8,
    features: ["Family Plans", "Student Tools", "Business OS"],
    color: "from-orange-500/20 to-amber-500/20",
    path: "/hubs/lifestyle"
  },
  {
    id: "premium",
    icon: Sparkles,
    title: "Premium",
    description: "Advanced financial solutions",
    featureCount: 9,
    features: ["Family Office", "Alternatives Portal", "LifeSim"],
    color: "from-indigo-500/20 to-violet-500/20",
    path: "/hubs/premium"
  }
];

export const FeatureHubs = memo(() => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const hubCards = useMemo(() => 
    hubs.map((hub, index) => {
      const Icon = hub.icon;
      return (
        <motion.div
          key={hub.id}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={prefersReducedMotion ? {} : { y: -8 }}
          onClick={() => handleNavigate(hub.path)}
          className="group cursor-pointer"
        >
          <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${hub.color} border border-border/50 backdrop-blur-sm h-full transition-all duration-300 hover:border-primary/50 hover:shadow-xl`}>
            <div className="flex items-start justify-between mb-6">
              <div className="p-3 rounded-2xl bg-background/80 backdrop-blur">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/20 text-sm font-semibold text-primary">
                {hub.featureCount} tools
              </span>
            </div>
            
            <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
              {hub.title}
            </h3>
            <p className="text-muted-foreground mb-6">
              {hub.description}
            </p>
            
            <ul className="space-y-2 mb-6">
              {hub.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
              Explore {hub.title}
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      );
    }),
    [prefersReducedMotion, handleNavigate]
  );

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            63+ Financial Tools Organized Into
            <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              5 Powerful Hubs
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to save smarter, grow wealth, and automate your finances—all in one place
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {hubCards}
        </div>
      </div>
    </section>
  );
});
