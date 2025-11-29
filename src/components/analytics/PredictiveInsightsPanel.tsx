import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Lightbulb,
  RefreshCw,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsight {
  id: string;
  type: 'trend' | 'alert' | 'upcoming' | 'tip';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  actionUrl?: string;
}

interface PredictiveInsightsPanelProps {
  insights: AIInsight[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const INSIGHT_ICONS: Record<string, typeof TrendingUp> = {
  trend: TrendingUp,
  alert: AlertTriangle,
  upcoming: Calendar,
  tip: Lightbulb,
};

const SEVERITY_STYLES: Record<string, string> = {
  info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  success: 'bg-green-500/10 text-green-600 border-green-500/20',
  error: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const TYPE_LABELS: Record<string, string> = {
  trend: 'Trend',
  alert: 'Alert',
  upcoming: 'Upcoming',
  tip: 'Tip',
};

export function PredictiveInsightsPanel({
  insights,
  isLoading,
  onRefresh,
  isRefreshing,
}: PredictiveInsightsPanelProps) {
  const prefersReducedMotion = useReducedMotion();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-orbital" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">AI-Powered Insights</h3>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          )}
        </div>

        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              Add more transactions to receive personalized insights
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight, index) => {
              const Icon = INSIGHT_ICONS[insight.type] || Lightbulb;
              
              return (
                <motion.div
                  key={insight.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-4 rounded-orbital border transition-all hover:shadow-md",
                    SEVERITY_STYLES[insight.severity]
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-background/50">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
                          {TYPE_LABELS[insight.type]}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1 line-clamp-1">
                        {insight.title}
                      </h4>
                      <p className="text-xs opacity-80 line-clamp-2">
                        {insight.description}
                      </p>
                      {insight.actionUrl && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto mt-2 text-xs"
                          asChild
                        >
                          <a href={insight.actionUrl}>
                            Learn more <ArrowRight className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
