import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Wallet, PieChart, DollarSign, Receipt, CreditCard, Coins, Zap, BadgeDollarSign, Activity, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Suspense, lazy, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// Layer 1: Background Effects
const ProceduralHubBackground = lazy(() => import("@/components/hubs/money/effects/ProceduralHubBackground").then(m => ({ default: m.ProceduralHubBackground })));
const MoneyFlowParticles = lazy(() => import("@/components/hubs/money/effects/MoneyFlowParticles").then(m => ({ default: m.MoneyFlowParticles })));

// Layer 2: Core Features - Direct imports (always visible)
import { AICommandCenter } from "@/components/hubs/money/ai/AICommandCenter";
import { SmartFeatureRecommender } from "@/components/hubs/money/ai/SmartFeatureRecommender";
import { LiquidCardMorph } from "@/components/hubs/money/effects/LiquidCardMorph";

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
  {
    icon: Activity,
    title: "Financial Pulse",
    description: "Real-time financial health monitoring",
    path: "/financial-pulse",
    color: "text-green-500"
  },
  {
    icon: Users,
    title: "Expense Split",
    description: "Split bills with friends",
    path: "/expense-split",
    color: "text-cyan-500"
  },
];

export default function ManageMoneyHub() {
  const [orderedFeatures, setOrderedFeatures] = useState(features);
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      {/* Layer 1: Ambient Background Effects - Desktop only */}
      {!isMobile && (
        <Suspense fallback={null}>
          <ProceduralHubBackground />
          <MoneyFlowParticles />
        </Suspense>
      )}

      {/* Layer 2: Core Content */}
      <div className={cn(
        "container mx-auto max-w-7xl relative z-10",
        "px-4 sm:px-6 lg:px-8",
        "py-6 md:py-8 lg:py-10"
      )}>
        {/* Header - Mobile-first responsive */}
        <motion.div 
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
            {/* Left: Icon + Title */}
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
                <Wallet className="w-8 h-8 md:w-10 md:h-10 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.3)]" />
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
            
            {/* Right: Stats - Stack on mobile, row on tablet+ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: isMobile ? 0 : 0.3,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="flex gap-2 md:gap-3 w-full md:w-auto"
            >
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 8px 20px -4px hsl(var(--primary) / 0.3)"
                }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-sm shadow-sm"
              >
                <div className="text-[10px] md:text-xs text-muted-foreground font-medium">Total Accounts</div>
                <div className="text-lg md:text-xl font-bold text-primary">8</div>
              </motion.div>
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 8px 20px -4px hsl(var(--accent) / 0.3)"
                }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 backdrop-blur-sm shadow-sm"
              >
                <div className="text-[10px] md:text-xs text-muted-foreground font-medium">Active Features</div>
                <div className="text-lg md:text-xl font-bold text-accent">{features.length}</div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* AI Command Center - Compact */}
        <AICommandCenter />

        {/* Smart Feature Recommender - Invisible, Just Reorders */}
        <SmartFeatureRecommender 
          features={features}
          onReorder={setOrderedFeatures}
        />

        {/* Feature Grid - Optimized responsive breakpoints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
          {orderedFeatures.map((feature, index) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: isMobile ? 0 : index * 0.05,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <LiquidCardMorph>
                <Link
                    to={feature.path}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
                  >
                    <Card className={cn(
                      "group overflow-hidden relative h-full",
                      "p-4 md:p-5 lg:p-6",
                      "hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer",
                      "border-2 hover:border-primary/30",
                      "active:scale-95",
                      "min-h-[44px]",
                      "backdrop-blur-sm bg-background/95"
                    )}>
                      {/* Gradient background on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl bg-gradient-to-br from-primary/20 to-accent/20 -z-10" />
                      
                      <div className="relative z-10">
                        {/* Icon - Responsive sizing */}
                        <motion.div
                          whileHover={{ 
                            scale: 1.1, 
                            rotate: 5,
                            y: -2
                          }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 10 
                          }}
                          className="mb-3 md:mb-4"
                        >
                          <feature.icon className={cn(
                            feature.color,
                            "w-10 h-10 md:w-12 md:h-12",
                            "transition-all duration-300 group-hover:drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
                            "group-hover:brightness-110"
                          )} />
                        </motion.div>
                        
                        {/* Title - Responsive text */}
                        <h3 className={cn(
                          "font-semibold mb-1.5 md:mb-2",
                          "text-base md:text-lg lg:text-xl",
                          "group-hover:text-primary transition-colors"
                        )}>
                          {feature.title}
                        </h3>
                        
                        {/* Description - Adaptive with line clamp */}
                        <p className={cn(
                          "text-muted-foreground",
                          "text-xs md:text-sm",
                          "line-clamp-2"
                        )}>
                          {feature.description}
                        </p>
                        
                        {/* Arrow indicator - Hidden on mobile */}
                        <motion.div
                          className="absolute bottom-3 md:bottom-4 right-3 md:right-4 opacity-0 group-hover:opacity-100 hidden sm:block"
                          initial={{ x: -10 }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30 shadow-sm">
                            <motion.span 
                              className="text-primary text-xs md:text-sm font-semibold"
                              animate={{ x: [0, 2, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                              →
                            </motion.span>
                          </div>
                        </motion.div>
                      </div>
                    </Card>
                  </Link>
                </LiquidCardMorph>
            </motion.div>
          ))}
        </div>
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
