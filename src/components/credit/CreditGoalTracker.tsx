import { useState } from "react";
import { useCreditGoal } from "@/hooks/useCreditGoal";
import { useCreditScoreHistory } from "@/hooks/useCreditScoreHistory";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditGoalSetupModal } from "./CreditGoalSetupModal";
import { Target, Calendar, TrendingUp, CheckCircle2, Edit, Trash2 } from "lucide-react";
import { calculateCreditProgress } from "@/lib/credit-notification-scheduler";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function CreditGoalTracker() {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const { currentGoal, isLoading, createGoal, deleteGoal, isCreating } = useCreditGoal();
  const { data: scoreHistory } = useCreditScoreHistory("30d");

  const currentScore = scoreHistory?.[scoreHistory.length - 1]?.score || 0;

  // Fetch AI timeline prediction
  const { data: timeline } = useQuery({
    queryKey: ["credit-goal-timeline", currentGoal?.id],
    queryFn: async () => {
      if (!currentGoal) return null;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-credit-goal-timeline`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentScore,
            targetScore: currentGoal.target_score,
            scoreHistory: scoreHistory || [],
          }),
        }
      );

      if (!response.ok) return null;
      return await response.json();
    },
    enabled: !!currentGoal && scoreHistory && scoreHistory.length > 0,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (!currentGoal) {
    return (
      <>
        <Card className="p-8 text-center border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Set a Credit Score Goal</h3>
              <p className="text-muted-foreground max-w-md">
                Track your progress toward a target score with AI-powered timeline predictions and
                personalized action steps.
              </p>
            </div>
            <Button onClick={() => setShowSetupModal(true)} size="lg" className="mt-2">
              <Target className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </div>
        </Card>

        <CreditGoalSetupModal
          open={showSetupModal}
          onOpenChange={setShowSetupModal}
          currentScore={currentScore}
          onSubmit={(goal) => {
            createGoal(goal);
            setShowSetupModal(false);
          }}
          isLoading={isCreating}
        />
      </>
    );
  }

  const progress = calculateCreditProgress(
    currentScore,
    currentGoal.target_score,
    currentGoal.starting_score
  );

  return (
    <>
      <Card className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Credit Score Goal</h3>
              {currentGoal.reason && (
                <p className="text-sm text-muted-foreground">{currentGoal.reason}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSetupModal(true)}
              title="Edit goal"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteGoal(currentGoal.id)}
              title="Delete goal"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Circle */}
        <div className="relative flex flex-col items-center py-8">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold">{currentScore}</div>
              <div className="text-sm text-muted-foreground">→ {currentGoal.target_score}</div>
              <div className="text-xs text-muted-foreground mt-1">{Math.round(progress)}%</div>
            </div>
          </div>
        </div>

        {/* Timeline Estimate */}
        {timeline && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
            <Calendar className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <div className="text-sm font-medium">Estimated Timeline</div>
              <div className="text-sm text-muted-foreground">{timeline.estimate}</div>
            </div>
          </div>
        )}

        {currentGoal.target_date && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <div className="text-sm font-medium">Target Date</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(currentGoal.target_date), "MMMM d, yyyy")}
              </div>
            </div>
          </div>
        )}

        {/* Action Checklist */}
        {timeline?.actionSteps && timeline.actionSteps.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Action Steps to Reach Your Goal
            </h4>
            <div className="space-y-2">
              {timeline.actionSteps.map((step: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1">{step}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <CreditGoalSetupModal
        open={showSetupModal}
        onOpenChange={setShowSetupModal}
        currentScore={currentScore}
        onSubmit={(goal) => {
          // Update existing goal
          if (currentGoal) {
            deleteGoal(currentGoal.id);
          }
          createGoal(goal);
          setShowSetupModal(false);
        }}
        isLoading={isCreating}
      />
    </>
  );
}
