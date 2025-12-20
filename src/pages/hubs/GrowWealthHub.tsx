import { AppLayout } from "@/components/layout/AppLayout";
import { Target, TrendingUp, BadgeDollarSign, Wallet as WalletIconLucide, CreditCard, Trophy, ChevronUp, PiggyBank, Shield, Sparkles, Calculator, DollarSign, Flame, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import { GrowWealthBackground } from "@/components/hubs/wealth/GrowWealthBackground";
import { GrowWealthBentoCard } from "@/components/hubs/wealth/GrowWealthBentoCard";
import { 
  GoalsIcon, 
  IncomeIcon, 
  NetWorthIcon, 
  InvestmentIcon, 
  RetirementIcon, 
  CreditScoreIcon, 
  WalletIcon, 
  CardIcon, 
  TrophyIcon, 
  ChallengesIcon, 
  TaxIcon 
} from "@/components/hubs/wealth/GrowWealthAnimatedIcons";
import { WealthDashboardSummary } from "@/components/hubs/wealth/WealthDashboardSummary";
import { FinancialHealthWidget } from "@/components/hubs/wealth/FinancialHealthWidget";
import { NetWorthBreakdownChart } from "@/components/hubs/wealth/NetWorthBreakdownChart";
import { MonthlyFinancialReport } from "@/components/hubs/wealth/MonthlyFinancialReport";
import { WealthProgressOverview } from "@/components/hubs/wealth/WealthProgressOverview";
import { WealthQuickActions } from "@/components/hubs/wealth/WealthQuickActions";
import { GrowWealthHubSkeleton } from "@/components/hubs/wealth/GrowWealthHubSkeleton";
import { useWealthHubStats } from "@/hooks/useWealthHubStats";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import CountUp from "react-countup";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Goals",
    description: "Set and track your savings goals",
    path: "/goals",
    icon: <GoalsIcon />,
    size: "lg" as const,
    badge: "Popular",
    showSparkline: true,
  },
  {
    title: "Income Tracking",
    description: "Track all your income sources",
    path: "/income",
    icon: <IncomeIcon />,
    size: "sm" as const,
    badge: "New",
  },
  {
    title: "Net Worth",
    description: "Track your total wealth over time",
    path: "/net-worth",
    icon: <NetWorthIcon />,
    size: "md" as const,
    badge: "New",
    showSparkline: true,
  },
  {
    title: "Investments",
    description: "Track your investment portfolio",
    path: "/investments",
    icon: <InvestmentIcon />,
    size: "sm" as const,
    showSparkline: true,
  },
  {
    title: "Retirement Planner",
    description: "Monte Carlo projections & Social Security optimization",
    path: "/retirement-planner",
    icon: <RetirementIcon />,
    size: "sm" as const,
  },
  {
    title: "Credit Score",
    description: "Monitor your credit health",
    path: "/credit",
    icon: <CreditScoreIcon />,
    size: "sm" as const,
  },
  {
    title: "Wallet",
    description: "Manage your digital wallet",
    path: "/wallet",
    icon: <WalletIcon />,
    size: "sm" as const,
  },
  {
    title: "Card",
    description: "Your $ave+ secured credit card",
    path: "/card",
    icon: <CardIcon />,
    size: "sm" as const,
  },
  {
    title: "Achievements",
    description: "View your financial milestones",
    path: "/achievements",
    icon: <TrophyIcon />,
    size: "sm" as const,
  },
  {
    title: "Savings Challenges",
    description: "Gamified savings with streaks",
    path: "/savings-challenges",
    icon: <ChallengesIcon />,
    size: "wide" as const,
    badge: "New",
  },
  {
    title: "Tax Lots",
    description: "Track cost basis and harvest losses",
    path: "/investment-tax-lots",
    icon: <TaxIcon />,
    size: "sm" as const,
    badge: "New",
  },
];

export default function GrowWealthHub() {
  const prefersReducedMotion = useReducedMotion();
  const stats = useWealthHubStats();

  if (stats.isLoading) {
    return (
      <AppLayout>
        <GrowWealthHubSkeleton />
      </AppLayout>
    );
  }

  const statCards = [
    {
      label: "Total Saved",
      value: stats.totalSaved,
      format: "currency",
      trend: stats.totalSaved > 0 ? "up" : null,
      icon: PiggyBank,
    },
    {
      label: "Credit Score",
      value: stats.creditScore || 0,
      format: "number",
      change: stats.creditChange,
      trend: stats.creditChange > 0 ? "up" : stats.creditChange < 0 ? "down" : null,
      icon: Shield,
    },
    {
      label: "Active Goals",
      value: stats.activeGoals,
      format: "number",
      trend: stats.activeGoals > 0 ? "up" : null,
      icon: Target,
    },
    {
      label: "Card Status",
      value: stats.cardStatus,
      format: "text",
      trend: stats.cardStatus === "Active" ? "up" : null,
      icon: CreditCard,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.06,
        delayChildren: 0.15,
      },
    },
  };

  return (
    <AppLayout>
      <GrowWealthBackground />

      <div className="container mx-auto px-4 py-8 max-w-7xl relative">
        {/* Header with Metallic Shimmer */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start gap-4 mb-3">
            <motion.div
              animate={prefersReducedMotion ? {} : { 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <TrendingUp className="w-12 h-12 text-accent" />
            </motion.div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                {/* Metallic Gradient Header */}
                <h1 className="text-4xl md:text-5xl font-bold relative overflow-hidden">
                  <span className="bg-gradient-to-r from-muted-foreground via-accent to-foreground bg-clip-text text-transparent">
                    Grow Wealth
                  </span>
                  {/* Shimmer overlay */}
                  {!prefersReducedMotion && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                    />
                  )}
                </h1>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI-Powered
                </span>
              </div>
              <p className="text-muted-foreground text-lg">
                Build your future with goals, investments, and credit building
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {statCards.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -4 }}
              >
                <Card className="border-2 border-accent/20 bg-card/50 backdrop-blur-sm hover:border-accent/40 transition-all hover:shadow-lg hover:shadow-accent/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <StatIcon className="w-4 h-4 text-accent" />
                      </div>
                      {stat.trend && (
                        <ChevronUp
                          className={`w-5 h-5 ${
                            stat.trend === "up" ? "text-accent" : "text-destructive rotate-180"
                          }`}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">
                      {stat.format === "currency" && "$"}
                      {stat.format !== "text" ? (
                        <CountUp
                          end={stat.value as number}
                          duration={1.5}
                          decimals={0}
                          separator=","
                        />
                      ) : (
                        stat.value
                      )}
                    </p>
                    {stat.change !== undefined && stat.change !== 0 && (
                      <p className={`text-xs mt-1 ${stat.change > 0 ? "text-accent" : "text-destructive"}`}>
                        {stat.change > 0 ? "+" : ""}{stat.change}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Wealth Dashboard Summary */}
        <div className="mb-8">
          <WealthDashboardSummary />
        </div>

        {/* Financial Health Score Widget */}
        <div className="mb-8">
          <FinancialHealthWidget />
        </div>

        {/* Net Worth Breakdown Chart */}
        <div className="mb-8">
          <NetWorthBreakdownChart />
        </div>

        {/* Monthly Financial Report */}
        <div className="mb-8">
          <MonthlyFinancialReport />
        </div>

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

        {/* Feature Cards Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            Explore Features
          </h2>
          <p className="text-muted-foreground text-sm">
            Discover all the tools to grow your wealth
          </p>
        </div>

        {/* Tab Navigation Hint */}
        {!prefersReducedMotion && (
          <motion.div
            className="mb-6 flex justify-center"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/10 text-sm text-muted-foreground"
              animate={{
                boxShadow: [
                  '0 0 0 0 hsl(var(--accent) / 0)',
                  '0 0 20px 4px hsl(var(--accent) / 0.15)',
                  '0 0 0 0 hsl(var(--accent) / 0)',
                ],
              }}
              transition={{ duration: 2, repeat: 3, delay: 1 }}
            >
              <motion.span
                className="px-2 py-0.5 rounded bg-accent/15 text-accent font-medium text-xs"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: 3, delay: 1.2 }}
              >
                Tab
              </motion.span>
              to navigate
            </motion.div>
          </motion.div>
        )}

        {/* Bento Grid Feature Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <GrowWealthBentoCard
              key={feature.path}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              path={feature.path}
              size={feature.size}
              index={index}
              badge={feature.badge}
              showSparkline={feature.showSparkline}
              stat={
                feature.title === "Goals" && stats.activeGoals > 0
                  ? `${stats.activeGoals} active • ${Math.round(stats.overallProgress)}% complete`
                  : feature.title === "Credit Score" && stats.creditScore
                  ? `${stats.creditScore} pts${stats.creditChange > 0 ? ` ↑ +${stats.creditChange}` : ''}`
                  : feature.title === "Investments" && stats.investmentValue > 0
                  ? `$${stats.investmentValue.toFixed(0)} • +${stats.investmentChange}%`
                  : undefined
              }
            />
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
}
