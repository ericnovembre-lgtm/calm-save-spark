import { useState } from "react";
import { PageTransition } from "@/components/animations/PageTransition";
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

export default function Credit() {
  const { data: latestScore, isLoading } = useLatestCreditScore();
  const [projectedScore, setProjectedScore] = useState<number | undefined>();

  return (
    <PageTransition>
      <ScrollSection className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Credit Intelligence</h1>
          <p className="text-muted-foreground">
            Monitor your credit score, set goals, and track your progress with AI-powered insights.
          </p>
        </div>

        {/* Hero Section: Gauge + Score Card */}
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : latestScore ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        ) : null}

        {/* Credit Simulator */}
        {latestScore && (
          <CreditSimulator
            currentScore={latestScore.score}
            onProjectedScoreChange={setProjectedScore}
          />
        )}

        {/* Credit Health Factors */}
        <CreditFactorBars />

        {/* Credit Score History Chart */}
        <CreditScoreHistoryChart />

        {/* Credit Goal Tracker */}
        <CreditGoalTracker />

        {/* AI Credit Coach Tools */}
        <div className="space-y-8 mt-12">
          <div>
            <h2 className="text-2xl font-bold mb-1">AI Credit Coach</h2>
            <p className="text-sm text-muted-foreground">
              Powerful AI-driven tools to optimize your credit strategy
            </p>
          </div>

          {/* Score Analysis Section */}
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold">Score Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Understand your approval odds and identify report issues
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestScore && <ApprovalPowerCard currentScore={latestScore.score} />}
              {latestScore && <ForensicScanCard currentScore={latestScore.score} />}
            </div>
          </div>

          {/* Credit Optimization Section */}
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold">Credit Optimization</h3>
              <p className="text-sm text-muted-foreground">
                Maximize your credit limits and utilization strategy
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AZEOStrategistCard />
              <LimitLiftScriptCard />
            </div>
          </div>

          {/* Dispute & Recovery Section */}
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold">Dispute & Recovery</h3>
              <p className="text-sm text-muted-foreground">
                Challenge errors and request goodwill adjustments
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DisputeWizardCard />
              <GoodwillGhostwriterCard />
            </div>
          </div>

          {/* Account Management Section */}
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold">Account Management</h3>
              <p className="text-sm text-muted-foreground">
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
  );
}
