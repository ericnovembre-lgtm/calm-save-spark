import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollSection } from "@/components/animations/ScrollSection";
import { CreditScoreHistoryChart } from "@/components/credit/CreditScoreHistoryChart";
import { CreditGoalTracker } from "@/components/credit/CreditGoalTracker";

export default function Credit() {
  return (
    <PageTransition>
      <ScrollSection className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Credit Intelligence</h1>
          <p className="text-muted-foreground">
            Monitor your credit score, set goals, and track your progress with AI-powered insights.
          </p>
        </div>

        {/* Credit Score History Chart */}
        <CreditScoreHistoryChart />

        {/* Credit Goal Tracker */}
        <CreditGoalTracker />
      </ScrollSection>
    </PageTransition>
  );
}
