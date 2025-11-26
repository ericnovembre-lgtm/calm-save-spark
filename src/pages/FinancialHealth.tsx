import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useFinancialHealth } from "@/hooks/useFinancialHealth";
import { useFinancialHealthHistory, useFinancialHealthTrend } from "@/hooks/useFinancialHealthHistory";
import { HolographicHealthGlobe } from "@/components/financial-health/HolographicHealthGlobe";
import { LiquidMetricCard } from "@/components/financial-health/LiquidMetricCard";
import { ContextualAIAdvisor } from "@/components/financial-health/ContextualAIAdvisor";
import { PredictiveTimelineChart } from "@/components/financial-health/PredictiveTimelineChart";
import { HealthRadarChart } from "@/components/financial-health/HealthRadarChart";
import { ScenarioBuilder } from "@/components/financial-health/ScenarioBuilder";
import { CelebrationEffect } from "@/components/financial-health/CelebrationEffect";
import { RecommendationCard } from "@/components/financial-health/RecommendationCard";
import { ActionTimeline } from "@/components/financial-health/ActionTimeline";
import { BenchmarkComparison } from "@/components/analytics/BenchmarkComparison";
import { PredictiveHealthScore } from "@/components/ai/PredictiveHealthScore";
import { SectionDivider } from "@/components/financial-health/SectionDivider";
import { FinancialHealthSkeleton } from "@/components/financial-health/FinancialHealthSkeleton";
import { Card } from "@/components/ui/card";
import { 
  CreditCard, 
  TrendingDown, 
  PiggyBank, 
  Target, 
  TrendingUp, 
  Shield,
  BarChart3,
  Calculator,
  Users,
  Bell
} from "lucide-react";
import { ScrollSection } from "@/components/animations/ScrollSection";

export default function FinancialHealth() {
  const { data: healthData, isLoading } = useFinancialHealth();
  const { data: historyData } = useFinancialHealthHistory();
  const { data: trend } = useFinancialHealthTrend();
  const [dismissedRecommendations, setDismissedRecommendations] = useState<string[]>([]);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevScore, setPrevScore] = useState<number | null>(null);

  const handleDismissRecommendation = (id: string) => {
    setDismissedRecommendations([...dismissedRecommendations, id]);
  };

  // Check for score improvements to trigger celebration
  useEffect(() => {
    if (healthData?.overallScore && prevScore !== null) {
      const scoreDiff = healthData.overallScore - prevScore;
      if (scoreDiff >= 5) {
        setShowCelebration(true);
      } else if (scoreDiff <= -5) {
        setShowAIAdvisor(true);
      }
    }
    if (healthData?.overallScore) {
      setPrevScore(healthData.overallScore);
    }
  }, [healthData?.overallScore]);

  if (isLoading) return <AppLayout><FinancialHealthSkeleton /></AppLayout>;

  const activeRecommendations = healthData?.recommendations?.filter(
    (rec: any) => !dismissedRecommendations.includes(rec.id)
  ) || [];

  // Mock upcoming actions - in production, fetch from multiple sources
  const upcomingActions = [
    {
      id: '1',
      type: 'subscription' as const,
      title: 'Netflix Subscription Renewal',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 15.99,
      link: '/subscriptions',
    },
    {
      id: '2',
      type: 'bill' as const,
      title: 'Credit Card Payment Due',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 250,
      link: '/debts',
    },
    {
      id: '3',
      type: 'goal' as const,
      title: 'Emergency Fund Milestone',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      link: '/goals',
    },
  ];

  // Prepare radar chart data
  const radarMetrics = healthData?.components ? [
    { label: 'Credit', value: healthData.components.credit || 0, target: 80 },
    { label: 'Debt', value: healthData.components.debt || 0, target: 80 },
    { label: 'Savings', value: healthData.components.savings || 0, target: 80 },
    { label: 'Goals', value: healthData.components.goals || 0, target: 80 },
    { label: 'Investment', value: healthData.components.investment || 0, target: 80 },
    { label: 'Emergency', value: healthData.components.emergency_fund || 0, target: 80 },
  ] : [];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12 space-y-16 max-w-7xl">
        {/* Celebration Effect */}
        {showCelebration && (
          <CelebrationEffect
            trigger="score_increase"
            score={healthData?.overallScore}
          />
        )}

        {/* AI Advisor */}
        {showAIAdvisor && (
          <ContextualAIAdvisor
            trigger="score_drop"
            context={`Your financial health score dropped to ${healthData?.overallScore}. Let's explore what's happening and how we can improve it together.`}
            metric="overall score"
            onDismiss={() => setShowAIAdvisor(false)}
          />
        )}

        {/* Header with gradient background */}
        <ScrollSection>
          <div className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent blur-3xl -z-10" />
            <h1 className="text-6xl md:text-7xl font-display font-bold mb-4 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent animate-subtle-glow">
              Financial Health
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your comprehensive, AI-powered financial wellness dashboard
            </p>
          </div>
        </ScrollSection>

        {/* Hero Section - 3D Holographic Globe */}
        <ScrollSection>
          <Card className="overflow-hidden border-2 border-primary/10 shadow-2xl bg-gradient-to-br from-card via-card to-accent/5 backdrop-blur-xl">
            <HolographicHealthGlobe 
              score={healthData?.overallScore || 0} 
              trend={trend || 0}
            />
          </Card>
        </ScrollSection>

        {/* Predictive Timeline */}
        <ScrollSection>
          {historyData && historyData.length > 0 && (
            <>
              <SectionDivider 
                title="Score Projection" 
                subtitle="AI-powered 3-month forecast"
                icon={<TrendingUp className="w-6 h-6" />}
              />
              <PredictiveTimelineChart
                historicalData={historyData}
                currentScore={healthData?.overallScore || 0}
              />
            </>
          )}
        </ScrollSection>

        {/* Predictive Health Score */}
        <ScrollSection>
          <SectionDivider 
            title="Health Forecast" 
            subtitle="90-day AI prediction with actionable insights"
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <PredictiveHealthScore />
        </ScrollSection>

        {/* Breakdown Section - Liquid Metric Cards */}
        <ScrollSection>
          <SectionDivider 
            title="Health Breakdown" 
            subtitle="Detailed analysis of each financial dimension"
            icon={<BarChart3 className="w-6 h-6" />}
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <LiquidMetricCard
              title="Credit Health"
              subtitle="FICO Score Impact"
              value={`${Math.round((healthData?.components?.credit || 50) * 8.5)} / 850`}
              numericValue={Math.round((healthData?.components?.credit || 50) * 8.5)}
              score={healthData?.components?.credit || 50}
              icon={CreditCard}
              actionLabel="View Credit Report"
              actionLink="/credit"
            />
            
            <LiquidMetricCard
              title="Debt Management"
              subtitle="Total Debt Level"
              value="Low Risk"
              score={healthData?.components?.debt || 50}
              icon={TrendingDown}
              actionLabel="Manage Debts"
              actionLink="/debts"
            />
            
            <LiquidMetricCard
              title="Savings Progress"
              subtitle="Goal Achievement"
              value={`${healthData?.components?.savings || 50}%`}
              numericValue={healthData?.components?.savings || 50}
              score={healthData?.components?.savings || 50}
              icon={PiggyBank}
              actionLabel="Review Goals"
              actionLink="/goals"
            />
            
            <LiquidMetricCard
              title="Goal Tracking"
              subtitle="Goals on Track"
              value={`${healthData?.components?.goals || 50}%`}
              numericValue={healthData?.components?.goals || 50}
              score={healthData?.components?.goals || 50}
              icon={Target}
              actionLabel="Manage Goals"
              actionLink="/goals"
            />
            
            <LiquidMetricCard
              title="Investment Health"
              subtitle="Portfolio Diversity"
              value="Good"
              score={healthData?.components?.investment || 50}
              icon={TrendingUp}
              actionLabel="View Portfolio"
              actionLink="/investments"
            />
            
            <LiquidMetricCard
              title="Emergency Fund"
              subtitle="Months of Coverage"
              value={`${((healthData?.components?.emergency_fund || 50) / 20).toFixed(1)} months`}
              numericValue={((healthData?.components?.emergency_fund || 50) / 20)}
              score={healthData?.components?.emergency_fund || 50}
              icon={Shield}
              actionLabel="Build Fund"
              actionLink="/emergency-fund"
            />
          </div>
        </ScrollSection>

        {/* Health Radar Chart */}
        <ScrollSection>
          {radarMetrics.length > 0 && (
            <>
              <SectionDivider 
                title="360° Overview" 
                subtitle="Complete financial wellness snapshot"
                icon={<Target className="w-6 h-6" />}
              />
              <HealthRadarChart metrics={radarMetrics} />
            </>
          )}
        </ScrollSection>

        {/* Scenario Builder */}
        <ScrollSection>
          <SectionDivider 
            title="What-If Scenarios" 
            subtitle="Experiment and plan your financial future"
            icon={<Calculator className="w-6 h-6" />}
          />
          <ScenarioBuilder
            currentScore={healthData?.overallScore || 0}
            components={healthData?.components || {}}
          />
        </ScrollSection>

        {/* Benchmark Comparison */}
        <ScrollSection>
          <SectionDivider 
            title="Peer Comparison" 
            subtitle="See how you stack up anonymously"
            icon={<Users className="w-6 h-6" />}
          />
          <BenchmarkComparison />
        </ScrollSection>

        {/* Recommendations Section */}
        <ScrollSection>
          {activeRecommendations.length > 0 && (
            <>
              <SectionDivider 
                title="Personalized Insights" 
                subtitle="AI-powered recommendations just for you"
                icon={<TrendingUp className="w-6 h-6" />}
              />
              <div className="grid gap-6 md:grid-cols-2">
                {activeRecommendations.map((rec: any) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onDismiss={handleDismissRecommendation}
                  />
                ))}
              </div>
            </>
          )}
        </ScrollSection>

        {/* Upcoming Actions Timeline */}
        <ScrollSection>
          <SectionDivider 
            title="Upcoming Actions" 
            subtitle="Stay on top of your financial calendar"
            icon={<Bell className="w-6 h-6" />}
          />
          <Card className="p-8 border-2 border-border/50 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card via-card to-accent/5">
            <ActionTimeline items={upcomingActions} />
          </Card>
        </ScrollSection>
      </div>
    </AppLayout>
  );
}
