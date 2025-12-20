import { DashboardWidgetCard } from "@/components/dashboard/DashboardWidgetCard";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface CreditWidgetProps {
  score: number;
  change: number;
  goal?: {
    target: number;
    progress: number;
  };
}

export function CreditWidget({ score, change, goal }: CreditWidgetProps) {
  const getScoreTier = (score: number) => {
    if (score >= 800) return { label: "Exceptional", color: "text-green-600" };
    if (score >= 740) return { label: "Very Good", color: "text-amber-600" };
    if (score >= 670) return { label: "Good", color: "text-yellow-600" };
    if (score >= 580) return { label: "Fair", color: "text-orange-600" };
    return { label: "Poor", color: "text-red-600" };
  };

  const tier = getScoreTier(score);

  return (
    <DashboardWidgetCard lastUpdated="2h ago">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Credit Score</div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold">{score}</div>
            <div className={`text-sm font-medium ${tier.color}`}>{tier.label}</div>
          </div>
        </div>
        <Link to="/credit">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Score Change */}
      <div className="flex items-center gap-2 mb-4">
        {change >= 0 ? (
          <TrendingUp className="w-4 h-4 text-green-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-600" />
        )}
        <span className={`text-sm font-medium ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
          {change >= 0 ? "+" : ""}
          {change} points
        </span>
        <span className="text-xs text-muted-foreground">this month</span>
      </div>

      {/* Goal Progress */}
      {goal && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">Goal: {goal.target}</span>
            </div>
            <span className="font-medium">{Math.round(goal.progress)}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
        </div>
      )}

      <Link to="/credit">
        <Button variant="outline" className="w-full mt-4" size="sm">
          View Full Report
        </Button>
      </Link>
    </DashboardWidgetCard>
  );
}
