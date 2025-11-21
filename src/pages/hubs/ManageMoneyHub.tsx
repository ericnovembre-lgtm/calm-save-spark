import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Wallet, PieChart, DollarSign, Receipt, CreditCard, Coins, Zap, BadgeDollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Suspense, lazy, useState } from "react";

// Layer 1: Background Effects
const ProceduralHubBackground = lazy(() => import("@/components/hubs/money/effects/ProceduralHubBackground").then(m => ({ default: m.ProceduralHubBackground })));
const MoneyFlowParticles = lazy(() => import("@/components/hubs/money/effects/MoneyFlowParticles").then(m => ({ default: m.MoneyFlowParticles })));

// Layer 2: Core Features
const AICommandCenter = lazy(() => import("@/components/hubs/money/ai/AICommandCenter").then(m => ({ default: m.AICommandCenter })));
const SmartFeatureRecommender = lazy(() => import("@/components/hubs/money/ai/SmartFeatureRecommender").then(m => ({ default: m.SmartFeatureRecommender })));
const LazyLiquidCardMorph = lazy(() => import("@/components/hubs/money/effects/LiquidCardMorph").then(m => ({ default: m.LiquidCardMorph })));

// Layer 3: Interactive Overlays
const HubConversationAssistant = lazy(() => import("@/components/hubs/money/ai/HubConversationAssistant").then(m => ({ default: m.HubConversationAssistant })));
const VoiceHubControl = lazy(() => import("@/components/hubs/money/voice/VoiceHubControl").then(m => ({ default: m.VoiceHubControl })));
const HubPerformanceAI = lazy(() => import("@/components/hubs/money/performance/HubPerformanceAI").then(m => ({ default: m.HubPerformanceAI })));

const features = [
  {
    icon: PieChart,
    title: "Budget",
    description: "Track spending across categories",
    path: "/budget",
    color: "text-blue-500"
  },
  {
    icon: DollarSign,
    title: "Transactions",
    description: "View all your transactions",
    path: "/transactions",
    color: "text-green-500"
  },
  {
    icon: Receipt,
    title: "Subscriptions",
    description: "Manage recurring payments",
    path: "/subscriptions",
    color: "text-purple-500"
  },
  {
    icon: CreditCard,
    title: "Debts",
    description: "Track and pay off debts",
    path: "/debts",
    color: "text-red-500"
  },
  {
    icon: Coins,
    title: "Pots",
    description: "Organize savings in pots",
    path: "/pots",
    color: "text-yellow-500"
  },
  {
    icon: Zap,
    title: "Automations",
    description: "Set up automated savings rules",
    path: "/automations",
    color: "text-orange-500"
  },
  {
    icon: BadgeDollarSign,
    title: "Bill Negotiation",
    description: "Save money on recurring bills",
    path: "/bill-negotiation",
    color: "text-indigo-500"
  },
  {
    icon: Wallet,
    title: "Accounts",
    description: "Connect and manage accounts",
    path: "/accounts",
    color: "text-teal-500"
  },
];

export default function ManageMoneyHub() {
  const [orderedFeatures, setOrderedFeatures] = useState(features);

  return (
    <AppLayout>
      {/* Layer 1: Ambient Background Effects */}
      <Suspense fallback={null}>
        <ProceduralHubBackground />
        <MoneyFlowParticles />
      </Suspense>

      {/* Layer 2: Core Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Wallet className="w-10 h-10 text-primary" />
            Manage Money
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered financial control center
          </p>
        </motion.div>

        {/* AI Command Center - Compact */}
        <Suspense fallback={<div className="h-40 mb-8 animate-pulse bg-muted rounded-xl" />}>
          <AICommandCenter />
        </Suspense>

        {/* Smart Feature Recommender - Invisible, Just Reorders */}
        <Suspense fallback={null}>
          <SmartFeatureRecommender 
            features={features}
            onReorder={setOrderedFeatures}
          />
        </Suspense>

        {/* Feature Grid - Enhanced with Liquid Morph */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orderedFeatures.map((feature, index) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Suspense fallback={
                <Card className="p-6 h-full animate-pulse bg-muted" />
              }>
                <LazyLiquidCardMorph>
                  <Link to={feature.path}>
                    <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full">
                      <feature.icon className={`w-12 h-12 mb-4 ${feature.color}`} />
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </Card>
                  </Link>
                </LazyLiquidCardMorph>
              </Suspense>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Layer 3: Interactive Overlays - Single Suspense */}
      <Suspense fallback={null}>
        <HubConversationAssistant />
        <VoiceHubControl />
        <HubPerformanceAI />
      </Suspense>
    </AppLayout>
  );
}
