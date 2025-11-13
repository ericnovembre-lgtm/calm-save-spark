import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface MetricCardProps {
  title: string;
  value: string;
  score: number;
  icon: LucideIcon;
  trend?: number;
  actionLabel: string;
  actionLink: string;
  subtitle?: string;
}

export const MetricCard = ({
  title,
  value,
  score,
  icon: Icon,
  trend,
  actionLabel,
  actionLink,
  subtitle,
}: MetricCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-blue-600";
    if (score >= 40) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <Icon className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Current Status</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
        </div>

        <div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(score)} transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {trend !== undefined && (
          <p className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </p>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between group"
          asChild
        >
          <Link to={actionLink}>
            {actionLabel}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};
