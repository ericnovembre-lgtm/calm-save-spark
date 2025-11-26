import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, BadgeDollarSign, Wallet as WalletIcon, CreditCard, Trophy, ArrowRight, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LiquidCardMorph } from "@/components/hubs/money/effects/LiquidCardMorph";
import { WealthGrowthBackground } from "@/components/hubs/wealth/WealthGrowthBackground";
import { WealthParticles } from "@/components/hubs/wealth/WealthParticles";
import { WealthProgressOverview } from "@/components/hubs/wealth/WealthProgressOverview";
import { WealthQuickActions } from "@/components/hubs/wealth/WealthQuickActions";
import { WealthHubSkeleton } from "@/components/hubs/wealth/WealthHubSkeleton";
import { useWealthHubStats } from "@/hooks/useWealthHubStats";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import CountUp from "react-countup";

const features = [
  {
    icon: Target,
    title: "Goals",
    description: "Set and track your savings goals",
    path: "/goals",
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: TrendingUp,
    title: "Investments",
    description: "Track your investment portfolio",
    path: "/investments",
    color: "text-green-500",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: BadgeDollarSign,
    title: "Credit Score",
    description: "Monitor your credit health",
    path: "/credit",
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: WalletIcon,
    title: "Wallet",
    description: "Manage your digital wallet",
    path: "/wallet",
    color: "text-orange-500",
    gradient: "from-orange-500/20 to-yellow-500/20",
  },
  {
    icon: CreditCard,
    title: "Card",
    description: "Your $ave+ secured credit card",
    path: "/card",
    color: "text-indigo-500",
    gradient: "from-indigo-500/20 to-violet-500/20",
  },
  {
    icon: Trophy,
    title: "Achievements",
    description: "View your financial milestones",
    path: "/achievements",
    color: "text-yellow-500",
    gradient: "from-yellow-500/20 to-amber-500/20",
  },
];

export default function GrowWealthHub() {
  const prefersReducedMotion = useReducedMotion();
  const stats = useWealthHubStats();

  if (stats.isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <WealthHubSkeleton />
        </div>
      </AppLayout>
    );
  }

  const statCards = [
    {
      label: "Total Saved",
      value: stats.totalSaved,
      format: "currency",
      trend: stats.totalSaved > 0 ? "up" : null,
    },
    {
      label: "Credit Score",
      value: stats.creditScore || 0,
      format: "number",
      change: stats.creditChange,
      trend: stats.creditChange > 0 ? "up" : stats.creditChange < 0 ? "down" : null,
    },
    {
      label: "Active Goals",
      value: stats.activeGoals,
      format: "number",
      trend: stats.activeGoals > 0 ? "up" : null,
    },
    {
      label: "Card Status",
      value: stats.cardStatus,
      format: "text",
      trend: stats.cardStatus === "Active" ? "up" : null,
    },
  ];

  return (
    <AppLayout>
      <WealthGrowthBackground />
      <WealthParticles />

      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-primary" />
            Grow Wealth
          </h1>
          <p className="text-muted-foreground text-lg">
            Build your future with goals, investments, and credit building
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            >
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 hover:border-primary/40 transition-colors">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold">
                      {stat.format === "currency" && "$"}
                      {stat.format !== "text" ? (
                        <CountUp
                          end={stat.value as number}
                          duration={1.5}
                          decimals={stat.format === "currency" ? 0 : 0}
                          separator=","
                        />
                      ) : (
                        stat.value
                      )}
                    </p>
                    {stat.trend && (
                      <ChevronUp
                        className={`w-5 h-5 ${
                          stat.trend === "up" ? "text-green-500" : "text-red-500 rotate-180"
                        }`}
                      />
                    )}
                  </div>
                  {stat.change !== undefined && stat.change !== 0 && (
                    <p className={`text-xs mt-1 ${stat.change > 0 ? "text-green-500" : "text-red-500"}`}>
                      {stat.change > 0 ? "+" : ""}{stat.change}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Wealth Progress Overview */}
        <div className="mb-8">
          <WealthProgressOverview
            overallProgress={stats.overallProgress}
            nextMilestone={stats.nextMilestone}
            creditScore={stats.creditScore}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <WealthQuickActions />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="wait">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <motion.div
                  key={feature.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                >
                  <LiquidCardMorph delay={0.5 + index * 0.05}>
                    <Link to={feature.path}>
                      <Card className={`p-6 hover:shadow-lg transition-all cursor-pointer h-full border-2 hover:border-primary bg-gradient-to-br ${feature.gradient} group relative overflow-hidden`}>
                        {/* Glow effect on hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                          initial={{ x: "-100%" }}
                          whileHover={prefersReducedMotion ? {} : { x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-background/50 ${feature.color}`}>
                              <Icon className="w-8 h-8" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {feature.description}
                          </p>

                          {/* Dynamic stats based on feature */}
                          {feature.title === "Goals" && stats.activeGoals > 0 && (
                            <p className="text-xs text-primary mt-3 font-medium">
                              {stats.activeGoals} active • {Math.round(stats.overallProgress)}% complete
                            </p>
                          )}
                          {feature.title === "Credit Score" && stats.creditScore && (
                            <p className="text-xs text-primary mt-3 font-medium">
                              {stats.creditScore} pts {stats.creditChange > 0 && `↑ +${stats.creditChange}`}
                            </p>
                          )}
                          {feature.title === "Investments" && stats.investmentValue > 0 && (
                            <p className="text-xs text-primary mt-3 font-medium">
                              ${stats.investmentValue.toFixed(0)} • +{stats.investmentChange}%
                            </p>
                          )}
                        </div>
                      </Card>
                    </Link>
                  </LiquidCardMorph>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
