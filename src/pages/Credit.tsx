import { useState } from "react";
import { PageTransition } from "@/components/animations/PageTransition";
import { withPageMemo } from "@/lib/performance-utils";
import { withPageErrorBoundary } from "@/components/error/withPageErrorBoundary";
import { ScrollSection } from "@/components/animations/ScrollSection";
import { CreditScoreCard } from "@/components/credit/CreditScoreCard";
import { CreditScoreHistoryChart } from "@/components/credit/CreditScoreHistoryChart";
import { CreditGoalTracker } from "@/components/credit/CreditGoalTracker";
import { useLatestCreditScore } from "@/hooks/useLatestCreditScore";
import { Skeleton } from "@/components/ui/skeleton";
import { NeonCreditGauge } from "@/components/credit/NeonCreditGauge";
import { CreditFactorBars } from "@/components/credit/CreditFactorBars";
import { ApprovalPowerCard } from "@/components/credit/ApprovalPowerCard";
import { ForensicScanCard } from "@/components/credit/ForensicScanCard";
import { LimitLiftScriptCard } from "@/components/credit/LimitLiftScriptCard";
import { InquiryDetectiveCard } from "@/components/credit/InquiryDetectiveCard";
import { DisputeWizardCard } from "@/components/credit/DisputeWizardCard";
import { AZEOStrategistCard } from "@/components/credit/AZEOStrategistCard";
import { GoodwillGhostwriterCard } from "@/components/credit/GoodwillGhostwriterCard";
import { ClosureSimulatorCard } from "@/components/credit/ClosureSimulatorCard";
import { CreditSimulator } from "@/components/credit/CreditSimulator";
import { AppLayout } from "@/components/layout/AppLayout";

function CreditPage() {
  const { data: latestScore, isLoading } = useLatestCreditScore();
  const [projectedScore, setProjectedScore] = useState<number | undefined>();

  return (
    <AppLayout>
      <PageTransition>
        <ScrollSection className="space-y-10">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              Credit Intelligence
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Monitor your credit score, set goals, and track your progress with AI-powered insights.
            </p>
          </div>

          {/* Hero Section: Gauge + Score Card */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-[320px] w-full rounded-2xl" />
              <Skeleton className="h-[320px] w-full rounded-2xl" />
            </div>
          ) : latestScore ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              <NeonCreditGauge 
                score={latestScore.score} 
                projectedScore={projectedScore}
              />
              <CreditScoreCard
                score={latestScore.score}
                change={latestScore.change}
                provider={latestScore.provider}
                date={latestScore.date}
                factors={latestScore.factors}
              />
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <p className="text-muted-foreground text-lg">No credit score data available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Connect your accounts to start tracking your credit.</p>
            </div>
          )}

          {/* Credit Simulator */}
          {latestScore && (
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CreditSimulator
                currentScore={latestScore.score}
                onProjectedScoreChange={setProjectedScore}
              />
            </div>
          )}

          {/* Credit Health Factors */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CreditFactorBars />
          </div>

          {/* Credit Score History Chart */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CreditScoreHistoryChart />
          </div>

          {/* Credit Goal Tracker */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CreditGoalTracker />
          </div>

          {/* AI Credit Coach Tools */}
          <div className="space-y-10 mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">AI Credit Coach</h2>
              <p className="text-base text-muted-foreground">
                Powerful AI-driven tools to optimize your credit strategy
              </p>
            </div>

            {/* Score Analysis Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-5 py-1">
                <h3 className="text-xl font-semibold mb-1">Score Analysis</h3>
                <p className="text-muted-foreground">
                  Understand your approval odds and identify report issues
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestScore && <ApprovalPowerCard currentScore={latestScore.score} />}
                {latestScore && <ForensicScanCard currentScore={latestScore.score} />}
              </div>
            </div>

            {/* Credit Optimization Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-5 py-1">
                <h3 className="text-xl font-semibold mb-1">Credit Optimization</h3>
                <p className="text-muted-foreground">
                  Maximize your credit limits and utilization strategy
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AZEOStrategistCard />
                <LimitLiftScriptCard />
              </div>
            </div>

            {/* Dispute & Recovery Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-5 py-1">
                <h3 className="text-xl font-semibold mb-1">Dispute & Recovery</h3>
                <p className="text-muted-foreground">
                  Challenge errors and request goodwill adjustments
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DisputeWizardCard />
                <GoodwillGhostwriterCard />
              </div>
            </div>

            {/* Account Management Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-5 py-1">
                <h3 className="text-xl font-semibold mb-1">Account Management</h3>
                <p className="text-muted-foreground">
                  Decode inquiries and simulate account closures
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InquiryDetectiveCard />
                <ClosureSimulatorCard />
              </div>
            </div>
          </div>
        </ScrollSection>
      </PageTransition>
    </AppLayout>
  );
}

export default withPageErrorBoundary(withPageMemo(CreditPage, 'Credit'), 'Credit');
