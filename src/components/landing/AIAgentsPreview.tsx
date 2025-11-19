import { Brain, Calculator, TrendingUp, CreditCard, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const agents = [
  {
    icon: Sparkles,
    name: "Financial Coach",
    description: "Personalized guidance for daily money decisions",
    color: "hsl(var(--primary))",
  },
  {
    icon: Calculator,
    name: "Tax Assistant",
    description: "Smart tax planning and deduction optimization",
    color: "hsl(var(--accent))",
  },
  {
    icon: TrendingUp,
    name: "Investment Research",
    description: "Market insights and portfolio recommendations",
    color: "hsl(var(--primary))",
  },
  {
    icon: CreditCard,
    name: "Debt Advisor",
    description: "Strategic debt payoff planning",
    color: "hsl(var(--accent))",
  },
  {
    icon: Heart,
    name: "Life Planner",
    description: "Long-term financial goal planning",
    color: "hsl(var(--primary))",
  },
  {
    icon: Brain,
    name: "Onboarding Guide",
    description: "Get started with personalized setup",
    color: "hsl(var(--accent))",
  },
];

export const AIAgentsPreview = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-24 px-4 md:px-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto relative z-10 max-w-6xl">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
            Meet Your 7+ AI Financial Specialists
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From coaching to forecasting—each AI agent is specialized for your financial success
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.name}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={!prefersReducedMotion ? { y: -4 } : {}}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                  style={{ backgroundColor: `${agent.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: agent.color }} />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                  {agent.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {agent.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="gap-2"
          >
            <Brain className="w-5 h-5" />
            Start Chatting with AI Agents
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
