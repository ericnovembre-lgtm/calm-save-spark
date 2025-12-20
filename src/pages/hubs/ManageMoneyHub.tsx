import { AppLayout } from "@/components/layout/AppLayout";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense, lazy, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// Layer 1: Background Effects
const ManageMoneyBackground = lazy(() => import("@/components/hubs/money/effects/ManageMoneyBackground"));

// Layer 2: Core Features
import { AICommandCenter } from "@/components/hubs/money/ai/AICommandCenter";
import { SmartFeatureRecommender } from "@/components/hubs/money/ai/SmartFeatureRecommender";
import { MoneyBentoCard } from "@/components/hubs/money/MoneyBentoCard";
import type { AnimatedIconName } from "@/components/hubs/money/ManageMoneyAnimatedIcons";

// Layer 3: Interactive Overlays
const HubConversationAssistant = lazy(() => import("@/components/hubs/money/ai/HubConversationAssistant").then(m => ({ default: m.HubConversationAssistant })));
const VoiceHubControl = lazy(() => import("@/components/hubs/money/voice/VoiceHubControl").then(m => ({ default: m.VoiceHubControl })));
const HubPerformanceAI = lazy(() => import("@/components/hubs/money/performance/HubPerformanceAI").then(m => ({ default: m.HubPerformanceAI })));

interface Feature {
  iconName: AnimatedIconName;
  title: string;
  description: string;
  path: string;
}

const features: Feature[] = [
  {
    iconName: "Budget",
    title: "Budget",
    description: "Track spending across categories",
    path: "/budget",
  },
  {
    iconName: "Transactions",
    title: "Transactions",
    description: "View all your transactions",
    path: "/transactions",
  },
  {
    iconName: "Subscriptions",
    title: "Subscriptions",
    description: "Manage recurring payments",
    path: "/subscriptions",
  },
  {
    iconName: "Debts",
    title: "Debts",
    description: "Track and pay off debts",
    path: "/debts",
  },
  {
    iconName: "Pots",
    title: "Pots",
    description: "Organize savings in pots",
    path: "/pots",
  },
  {
    iconName: "Automations",
    title: "Automations",
    description: "Set up automated savings rules",
    path: "/automations",
  },
  {
    iconName: "Bill Negotiation",
    title: "Bill Negotiation",
    description: "Save money on recurring bills",
    path: "/bill-negotiation",
  },
  {
    iconName: "Accounts",
    title: "Accounts",
    description: "Connect and manage accounts",
    path: "/accounts",
  },
  {
    iconName: "Financial Pulse",
    title: "Financial Pulse",
    description: "Real-time financial health monitoring",
    path: "/financial-pulse",
  },
  {
    iconName: "Expense Split",
    title: "Expense Split",
    description: "Split bills with friends",
    path: "/expense-split",
  },
  {
    iconName: "Smart Categories",
    title: "Smart Categories",
    description: "AI-powered transaction categorization",
    path: "/smart-categories",
  },
  {
    iconName: "Financial Calendar",
    title: "Financial Calendar",
    description: "View all financial events",
    path: "/financial-calendar",
  },
  {
    iconName: "Import/Export",
    title: "Import/Export",
    description: "Bulk data management",
    path: "/import-export",
  },
];

export default function ManageMoneyHub() {
  const [orderedFeatures, setOrderedFeatures] = useState(features);
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      {/* Layer 1: Digital Topography Background - Desktop only */}
      {!isMobile && (
        <Suspense fallback={null}>
          <ManageMoneyBackground />
        </Suspense>
      )}

      {/* Layer 2: Core Content */}
      <div className={cn(
        "container mx-auto max-w-7xl relative z-10",
        "px-4 sm:px-6 lg:px-8",
        "py-6 md:py-8 lg:py-10"
      )}>
        {/* Header */}
        <motion.div 
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="shrink-0"
              >
                <Wallet className="w-8 h-8 md:w-10 md:h-10 text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.4)]" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                  Manage Money
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  AI-powered financial control center
                </p>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: isMobile ? 0 : 0.3, duration: 0.5 }}
              className="flex gap-2 md:gap-3 w-full md:w-auto"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-1 md:flex-none px-3 md:px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm"
              >
                <div className="text-[10px] md:text-xs text-muted-foreground font-medium">Total Accounts</div>
                <div className="text-lg md:text-xl font-bold text-primary">8</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-1 md:flex-none px-3 md:px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 backdrop-blur-sm"
              >
                <div className="text-[10px] md:text-xs text-muted-foreground font-medium">Active Features</div>
                <div className="text-lg md:text-xl font-bold text-accent">{features.length}</div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* AI Command Center - Holographic HUD */}
        <AICommandCenter />

        {/* Smart Feature Recommender */}
        <SmartFeatureRecommender 
          features={features}
          onReorder={setOrderedFeatures}
        />

        {/* Feature Grid - Bento Cards with Magnetic Hover */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } }
          }}
        >
          {orderedFeatures.map((feature, index) => (
            <motion.div
              key={feature.path}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <MoneyBentoCard
                title={feature.title}
                description={feature.description}
                path={feature.path}
                iconName={feature.iconName}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Layer 3: Interactive Overlays - Desktop only */}
      {!isMobile && (
        <Suspense fallback={null}>
          <HubConversationAssistant />
          <VoiceHubControl />
          <HubPerformanceAI />
        </Suspense>
      )}
    </AppLayout>
  );
}
