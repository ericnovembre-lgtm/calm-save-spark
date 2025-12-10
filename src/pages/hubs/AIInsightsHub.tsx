import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Activity, Bot, Brain, Lightbulb, Shield, Sparkles, Archive } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  {
    icon: Bot,
    title: "AI Coach",
    description: "Chat with your financial coach",
    path: "/coach",
    color: "text-blue-500"
  },
  {
    icon: Brain,
    title: "AI Agents",
    description: "Autonomous financial assistants",
    path: "/ai-agents",
    color: "text-purple-500"
  },
  {
    icon: Activity,
    title: "Social Sentiment",
    description: "Real-time market sentiment by Grok",
    path: "/social-sentiment",
    color: "text-orange-500"
  },
  {
    icon: Sparkles,
    title: "Digital Twin",
    description: "Your financial simulation",
    path: "/digital-twin",
    color: "text-pink-500"
  },
  {
    icon: Lightbulb,
    title: "Analytics & Insights",
    description: "Financial insights and forecasting",
    path: "/analytics",
    color: "text-yellow-500"
  },
  {
    icon: Shield,
    title: "Guardian",
    description: "Behavioral spending protection",
    path: "/guardian",
    color: "text-red-500"
  },
  {
    icon: Archive,
    title: "AI Insights Archive",
    description: "Historical AI-generated insights and recommendations",
    path: "/ai-insights-archive",
    color: "text-emerald-500"
  },
];

export default function AIInsightsHub() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-primary" />
            AI & Insights
          </h1>
          <p className="text-muted-foreground text-lg">
            Powered by AI to help you make smarter financial decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={feature.path}>
                <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full border-2 hover:border-primary">
                  <feature.icon className={`w-12 h-12 mb-4 ${feature.color}`} />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
