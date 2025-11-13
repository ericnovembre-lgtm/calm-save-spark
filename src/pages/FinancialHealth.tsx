import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingState } from "@/components/LoadingState";
import { useFinancialHealth } from "@/hooks/useFinancialHealth";
import { HealthScoreGauge } from "@/components/financial-health/HealthScoreGauge";
import { MetricCard } from "@/components/financial-health/MetricCard";
import { RecommendationCard } from "@/components/financial-health/RecommendationCard";
import { ActionTimeline } from "@/components/financial-health/ActionTimeline";
import { Card } from "@/components/ui/card";
import { 
  CreditCard, 
  TrendingDown, 
  PiggyBank, 
  Target, 
  TrendingUp, 
  Shield 
} from "lucide-react";

export default function FinancialHealth() {
  const { data: healthData, isLoading } = useFinancialHealth();
  const [dismissedRecommendations, setDismissedRecommendations] = useState<string[]>([]);

  const handleDismissRecommendation = (id: string) => {
    setDismissedRecommendations([...dismissedRecommendations, id]);
  };

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

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Financial Health
          </h1>
          <p className="text-muted-foreground">
            Your comprehensive financial wellness overview
          </p>
        </div>

        {/* Hero Section - Health Score Gauge */}
        <Card className="p-8">
          <HealthScoreGauge 
            score={healthData?.overallScore || 0} 
            trend={0} // Calculate trend from historical data
          />
        </Card>

        {/* Breakdown Section - 6 Metric Cards */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Health Breakdown
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Credit Health"
              subtitle="FICO Score Impact"
              value={`${Math.round((healthData?.components?.credit || 50) * 8.5)} / 850`}
              score={healthData?.components?.credit || 50}
              icon={CreditCard}
              actionLabel="View Credit Report"
              actionLink="/credit"
            />
            
            <MetricCard
              title="Debt Management"
              subtitle="Total Debt Level"
              value="Low Risk"
              score={healthData?.components?.debt || 50}
              icon={TrendingDown}
              actionLabel="Manage Debts"
              actionLink="/debts"
            />
            
            <MetricCard
              title="Savings Progress"
              subtitle="Goal Achievement"
              value={`${healthData?.components?.savings || 50}%`}
              score={healthData?.components?.savings || 50}
              icon={PiggyBank}
              actionLabel="Review Goals"
              actionLink="/goals"
            />
            
            <MetricCard
              title="Goal Completion"
              subtitle="Active Goals"
              value={`${healthData?.components?.goals || 50}%`}
              score={healthData?.components?.goals || 50}
              icon={Target}
              actionLabel="Set New Goals"
              actionLink="/goals"
            />
            
            <MetricCard
              title="Investment Performance"
              subtitle="Portfolio ROI"
              value="Positive"
              score={healthData?.components?.investment || 50}
              icon={TrendingUp}
              actionLabel="Review Portfolio"
              actionLink="/investments"
            />
            
            <MetricCard
              title="Emergency Fund"
              subtitle="Months Covered"
              value={`${((healthData?.components?.emergencyFund || 50) / 100 * 6).toFixed(1)} months`}
              score={healthData?.components?.emergencyFund || 50}
              icon={Shield}
              actionLabel="Build Fund"
              actionLink="/goals"
            />
          </div>
        </div>

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
