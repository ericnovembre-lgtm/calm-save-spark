import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingState } from "@/components/LoadingState";
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
import { Card } from "@/components/ui/card";
import { 
  CreditCard, 
  TrendingDown, 
  PiggyBank, 
  Target, 
  TrendingUp, 
  Shield 
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

  if (isLoading) return <LoadingState />;

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
      <div className="container mx-auto px-4 py-8 space-y-12">
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

        {/* Header */}
        <ScrollSection>
          <div className="text-center">
            <h1 className="text-5xl font-display font-bold text-foreground mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Financial Health Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your comprehensive, AI-powered financial wellness center
            </p>
          </div>
        </ScrollSection>

        {/* Hero Section - 3D Holographic Globe */}
        <ScrollSection>
          <Card className="overflow-hidden border-2 border-primary/20">
            <HolographicHealthGlobe 
              score={healthData?.overallScore || 0} 
              trend={trend || 0}
            />
          </Card>
        </ScrollSection>


        {/* Recommendations Section */}
        {activeRecommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Personalized Recommendations
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {activeRecommendations.map((recommendation: any) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onDismiss={handleDismissRecommendation}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Timeline */}
        <ActionTimeline items={upcomingActions} />
      </div>
    </AppLayout>
  );
}
