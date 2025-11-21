import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Wallet, PieChart, DollarSign, Receipt, CreditCard, Coins, Zap, BadgeDollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Suspense, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load all advanced components
import {
  LazyAICommandCenter,
  LazySmartFeatureRecommender,
  LazyHubConversationAssistant,
  LazyFeatureUniverse3D,
  LazyLiquidCardMorph,
  LazyProceduralHubBackground,
  LazyMoneyFlowParticles,
  LazyPredictiveFeatureEngine,
  LazyHubAchievements,
  LazyDailyHubQuests,
  LazyLiveActivityStream,
  LazyVoiceHubControl,
  LazyAdaptiveComplexity,
  LazyHubTheaterMode,
  LazyHubTimeMachine,
  LazyHubPerformanceAI
} from "@/components/hubs/money/LazyMoneyHubComponents";

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
  const [complexityLevel, setComplexityLevel] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
  const [show3D, setShow3D] = useState(true);

  const handleReorderFeatures = (newFeatures: typeof features) => {
    setOrderedFeatures(newFeatures);
  };

  const renderFeatureCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {orderedFeatures.map((feature, index) => (
        <Suspense key={feature.path} fallback={<Skeleton className="h-48 rounded-3xl" />}>
          <LazyLiquidCardMorph delay={index * 0.05}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={feature.path}>
                <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full border-2 hover:border-primary bg-card/50 backdrop-blur-sm">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className={`w-12 h-12 mb-4 ${feature.color}`} />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                  
                  {/* AI confidence badge */}
                  {index < 3 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="mt-3 inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      ✨ AI Recommended
                    </motion.div>
                  )}
                </Card>
              </Link>
            </motion.div>
          </LazyLiquidCardMorph>
        </Suspense>
      ))}
    </div>
  );

  const hubContent = (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* AI Command Center */}
      <Suspense fallback={<Skeleton className="h-40 rounded-3xl mb-8" />}>
        <LazyAICommandCenter />
      </Suspense>

      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Wallet className="w-10 h-10 text-primary" />
          </motion.div>
          Manage Money
        </h1>
        <p className="text-muted-foreground text-lg">
          AI-powered money management with predictive insights
        </p>
      </motion.div>

      {/* Smart Feature Recommender */}
      <Suspense fallback={null}>
        <LazySmartFeatureRecommender 
          features={features} 
          onReorder={handleReorderFeatures} 
        />
      </Suspense>

      {/* Predictive Feature Engine */}
      <Suspense fallback={null}>
        <LazyPredictiveFeatureEngine />
      </Suspense>

      {/* Sidebar Features */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          {/* 3D Feature Universe (optional) */}
          {show3D && complexityLevel !== 'beginner' && (
            <Suspense fallback={<Skeleton className="h-96 rounded-3xl mb-8" />}>
              <LazyFeatureUniverse3D />
            </Suspense>
          )}

          {/* Feature Cards */}
          {renderFeatureCards()}
        </div>

        {/* Right Sidebar with AI Features */}
        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-64 rounded-3xl" />}>
            <LazyLiveActivityStream />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-64 rounded-3xl" />}>
            <LazyDailyHubQuests />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-64 rounded-3xl" />}>
            <LazyHubAchievements />
          </Suspense>
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      {/* Background Effects */}
      <Suspense fallback={null}>
        <LazyProceduralHubBackground />
      </Suspense>
      
      <Suspense fallback={null}>
        <LazyMoneyFlowParticles />
      </Suspense>

      {/* Theater Mode Wrapper */}
      <Suspense fallback={hubContent}>
        <LazyHubTheaterMode>
          {hubContent}
        </LazyHubTheaterMode>
      </Suspense>

      {/* Floating AI Assistant */}
      <Suspense fallback={null}>
        <LazyHubConversationAssistant />
      </Suspense>

      {/* Voice Control */}
      <Suspense fallback={null}>
        <LazyVoiceHubControl />
      </Suspense>

      {/* Time Machine */}
      <Suspense fallback={null}>
        <LazyHubTimeMachine />
      </Suspense>

      {/* Adaptive Complexity Control */}
      <Suspense fallback={null}>
        <LazyAdaptiveComplexity onLevelChange={setComplexityLevel} />
      </Suspense>

      {/* Performance Monitor */}
      <Suspense fallback={null}>
        <LazyHubPerformanceAI />
      </Suspense>
    </AppLayout>
  );
}
