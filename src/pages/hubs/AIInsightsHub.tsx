import { AppLayout } from "@/components/layout/AppLayout";
import { AIInsightsBackground } from "@/components/hubs/ai-insights/AIInsightsBackground";
import { BentoCard } from "@/components/hubs/ai-insights/BentoCard";
import { GradientHeader } from "@/components/hubs/ai-insights/GradientHeader";
import {
  AnimatedBotIcon,
  AnimatedBrainIcon,
  AnimatedActivityIcon,
  AnimatedSparklesIcon,
  AnimatedLightbulbIcon,
  AnimatedShieldIcon,
  AnimatedArchiveIcon,
} from "@/components/hubs/ai-insights/AnimatedIcons";

const features = [
  {
    icon: <AnimatedBotIcon size="lg" />,
    title: "AI Coach",
    description: "Chat with your personal financial coach. Get tailored advice, answer questions, and build better money habits through conversation.",
    path: "/coach",
    size: "lg" as const,
  },
  {
    icon: <AnimatedBrainIcon />,
    title: "AI Agents",
    description: "Autonomous assistants that work for you",
    path: "/ai-agents",
    size: "sm" as const,
  },
  {
    icon: <AnimatedActivityIcon />,
    title: "Social Sentiment",
    description: "Real-time market sentiment powered by Grok",
    path: "/social-sentiment",
    size: "sm" as const,
  },
  {
    icon: <AnimatedSparklesIcon />,
    title: "Digital Twin",
    description: "Simulate your financial future",
    path: "/digital-twin",
    size: "sm" as const,
  },
  {
    icon: <AnimatedLightbulbIcon size="lg" />,
    title: "Analytics & Insights",
    description: "Deep dive into your financial patterns. Discover trends, forecast spending, and uncover hidden opportunities to save and grow.",
    path: "/analytics",
    size: "lg" as const,
  },
  {
    icon: <AnimatedShieldIcon />,
    title: "Guardian",
    description: "Behavioral spending protection",
    path: "/guardian",
    size: "sm" as const,
  },
  {
    icon: <AnimatedArchiveIcon />,
    title: "AI Insights Archive",
    description: "Historical AI-generated insights and recommendations for reference",
    path: "/ai-insights-archive",
    size: "wide" as const,
  },
];

export default function AIInsightsHub() {
  return (
    <AppLayout>
      <AIInsightsBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <GradientHeader />

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
          {features.map((feature, index) => (
            <BentoCard
              key={feature.path}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              path={feature.path}
              size={feature.size}
              index={index}
            />
          ))}
        </div>

        {/* Bottom gradient fade */}
        <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-0" />
      </div>
    </AppLayout>
  );
}
