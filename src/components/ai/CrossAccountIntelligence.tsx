import { motion } from "framer-motion";
import { 
  Network, AlertTriangle, TrendingUp, Wallet, 
  Shield, Lightbulb, Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCrossAccountInsights } from "@/hooks/useCrossAccountInsights";

const impactColors = {
  low: "border-muted",
  medium: "border-primary",
  high: "border-accent",
  critical: "border-destructive"
};

const impactBgColors = {
  low: "bg-muted/50",
  medium: "bg-primary/5",
  high: "bg-accent/10",
  critical: "bg-destructive/5"
};

const typeIcons = {
  cash_flow: Network,
  low_utilization: Activity,
  optimization_opportunity: Lightbulb,
  redundancy: AlertTriangle,
  card_optimization: Wallet,
  forecast: TrendingUp,
  risk: Shield
};

export function CrossAccountIntelligence() {
  const { data, isLoading, error } = useCrossAccountInsights();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <h3 className="text-lg font-semibold mb-2">Unable to Analyze</h3>
        <p className="text-sm text-muted-foreground">
          {error?.message || 'No accounts found to analyze'}
        </p>
      </Card>
    );
  }

  const { insights, summary } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
          <Network className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Cross-Account Intelligence</h2>
          <p className="text-sm text-muted-foreground">
            Unified insights across all {summary.totalAccounts} connected accounts
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Balance</div>
          <div className="text-2xl font-bold text-primary">
            ${summary.totalBalance.toFixed(0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Active Accounts</div>
          <div className="text-2xl font-bold text-accent">
            {summary.activeAccounts}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Insights Found</div>
          <div className="text-2xl font-bold">
            {summary.insightCount}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Health Score</div>
          <div className="text-2xl font-bold text-green-500">
            {summary.activeAccounts > 0 ? Math.round((summary.activeAccounts / summary.totalAccounts) * 100) : 0}%
          </div>
        </Card>
      </div>

      {/* Insights Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {insights.map((insight, index) => {
          const Icon = typeIcons[insight.type as keyof typeof typeIcons] || Lightbulb;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`p-6 border-l-4 ${impactColors[insight.impact]} ${impactBgColors[insight.impact]}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${impactBgColors[insight.impact]}`}>
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold">{insight.title}</h3>
                      <Badge variant="outline" className="flex-shrink-0">
                        {insight.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Insight
                    </div>
                    <div className="text-sm font-medium">
                      {insight.insight}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Recommendation
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {insight.recommendation}
                    </div>
                  </div>

                  {/* Confidence Meter */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{Math.round(insight.confidence * 100)}%</span>
                    </div>
                    <Progress value={insight.confidence * 100} className="h-2" />
                  </div>

                  {/* Special Data Visualizations */}
                  {insight.type === 'forecast' && insight.data && (
                    <div className="pt-3 border-t space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Current</div>
                          <div className="font-bold text-sm">
                            ${insight.data.current.toFixed(0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">30 Days</div>
                          <div className="font-bold text-sm text-primary">
                            ${insight.data.forecast30Days.toFixed(0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">60 Days</div>
                          <div className="font-bold text-sm text-accent">
                            ${insight.data.forecast60Days.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {insights.length === 0 && (
        <Card className="p-8 text-center">
          <Network className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
          <p className="text-sm text-muted-foreground">
            Your accounts are well optimized. Keep up the good work!
          </p>
        </Card>
      )}
    </div>
  );
}