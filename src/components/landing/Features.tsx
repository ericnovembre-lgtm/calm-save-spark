import { TrendingUp, Shield, Zap, Target, Brain, Sparkles } from "lucide-react";
import { TiltCard3D } from "@/components/welcome/advanced/TiltCard3D";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const features = [
  {
    id: 1,
    icon: <TrendingUp className="w-6 h-6 text-accent" />,
    title: "Smart Round-Ups",
    description: "Automatically round up purchases and save the spare change without thinking about it.",
  },
  {
    id: 2,
    icon: <Brain className="w-6 h-6 text-accent" />,
    title: "AI Insights",
    description: "Get personalized financial advice and spending insights powered by advanced AI.",
  },
  {
    id: 3,
    icon: <Target className="w-6 h-6 text-accent" />,
    title: "Goal Tracking",
    description: "Set and achieve savings goals with visual progress tracking and milestones.",
  },
  {
    id: 4,
    icon: <Shield className="w-6 h-6 text-accent" />,
    title: "Bank-Level Security",
    description: "Your data is protected with 256-bit encryption and secure authentication.",
  },
  {
    id: 5,
    icon: <Zap className="w-6 h-6 text-accent" />,
    title: "Instant Transfers",
    description: "Move money between accounts instantly with real-time balance updates.",
  },
  {
    id: 6,
    icon: <Sparkles className="w-6 h-6 text-accent" />,
    title: "Rewards Program",
    description: "Earn points for consistent saving habits and unlock exclusive rewards.",
  },
];

export const Features = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 px-4 md:px-20" id="features">
      <div className="container mx-auto">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you save effortlessly and grow your wealth
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <TiltCard3D>
                <motion.div 
                  className="p-6 rounded-xl bg-card border border-border hover:border-accent transition-colors h-full backdrop-blur-sm"
                  whileHover={!prefersReducedMotion ? {
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  } : {}}
                >
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4"
                    whileHover={!prefersReducedMotion ? {
                      scale: 1.1,
                      rotate: 360,
                    } : {}}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="font-bold text-xl mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              </TiltCard3D>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
