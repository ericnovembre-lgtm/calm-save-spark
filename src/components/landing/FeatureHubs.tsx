import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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

export const FeatureHubs = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

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
          {hubs.map((hub, index) => {
            const Icon = hub.icon;
            return (
              <motion.div
                key={hub.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={prefersReducedMotion ? {} : { y: -8 }}
                onClick={() => navigate(hub.path)}
                className="group cursor-pointer"
              >
                <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${hub.color} border border-border/50 backdrop-blur-sm h-full transition-all duration-300 hover:border-primary/50 hover:shadow-xl`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 rounded-2xl bg-background/80 backdrop-blur">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-background/60 backdrop-blur text-foreground">
                      {hub.featureCount} tools
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{hub.title}</h3>
                  <p className="text-muted-foreground mb-6">{hub.description}</p>

                  <div className="space-y-2 mb-6">
                    {hub.features.map((feature, i) => (
                      <div key={i} className="flex items-center text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                    Explore hub
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
