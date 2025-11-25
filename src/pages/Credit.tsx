import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollSection } from "@/components/animations/ScrollSection";
import { CreditScoreCard } from "@/components/credit/CreditScoreCard";
import { CreditScoreHistoryChart } from "@/components/credit/CreditScoreHistoryChart";
import { CreditGoalTracker } from "@/components/credit/CreditGoalTracker";
import { useLatestCreditScore } from "@/hooks/useLatestCreditScore";
import { Skeleton } from "@/components/ui/skeleton";

export default function Credit() {
  const { data: latestScore, isLoading } = useLatestCreditScore();

  return (
    <PageTransition>
      <ScrollSection className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Credit Intelligence</h1>
          <p className="text-muted-foreground">
            Monitor your credit score, set goals, and track your progress with AI-powered insights.
          </p>
        </div>

        {/* Current Credit Score Card */}
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : latestScore ? (
          <CreditScoreCard
            score={latestScore.score}
            change={latestScore.change}
            provider={latestScore.provider}
            date={latestScore.date}
            factors={latestScore.factors}
          />
        ) : null}

        {/* Credit Score History Chart */}
        <CreditScoreHistoryChart />

        {/* Credit Goal Tracker */}
        <CreditGoalTracker />
      </ScrollSection>
    </PageTransition>
  );
}
