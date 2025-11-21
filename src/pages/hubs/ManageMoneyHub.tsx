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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Wallet className="w-10 h-10 text-primary" />
                </motion.div>
                Manage Money
              </h1>
              <p className="text-muted-foreground text-lg">
                AI-powered financial control center
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-sm"
              >
                <div className="text-xs text-muted-foreground">Total Accounts</div>
                <div className="text-lg font-bold text-primary">8</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 backdrop-blur-sm"
              >
                <div className="text-xs text-muted-foreground">Active Features</div>
                <div className="text-lg font-bold text-accent">{features.length}</div>
              </motion.div>
            </motion.div>
          </div>
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
                    <Card className="p-6 hover:shadow-xl transition-all cursor-pointer h-full group overflow-hidden relative border-2 hover:border-primary/30">
                      {/* Gradient background on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <feature.icon className={`w-12 h-12 mb-4 ${feature.color} transition-all group-hover:drop-shadow-lg`} />
                        </motion.div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                        
                        {/* Hover indicator */}
                        <motion.div
                          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100"
                          initial={{ x: -10 }}
                          whileHover={{ x: 0 }}
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary text-xs">→</span>
                          </div>
                        </motion.div>
                      </div>
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
