import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArchivedInsight, InsightImpactLevel } from '@/hooks/useInsightsArchive';
import { format } from 'date-fns';
import { Check, X, Lightbulb, TrendingUp, AlertTriangle, Zap, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const impactColors: Record<InsightImpactLevel, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

const typeIcons: Record<string, typeof Lightbulb> = {
  recommendation: Lightbulb,
  alert: AlertTriangle,
  opportunity: TrendingUp,
  automation: Zap,
  default: Bot,
};

interface InsightCardProps {
  insight: ArchivedInsight;
  onMarkActionTaken?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function InsightCard({ insight, onMarkActionTaken, onDismiss }: InsightCardProps) {
  const Icon = typeIcons[insight.insight_type] || typeIcons.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`p-4 ${insight.dismissed ? 'opacity-50' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-medium">{insight.title}</h4>
              {insight.impact_level && (
                <Badge variant="secondary" className={impactColors[insight.impact_level]}>
                  {insight.impact_level}
                </Badge>
              )}
              {insight.action_taken && (
                <Badge variant="outline" className="text-green-600">
                  <Check className="w-3 h-3 mr-1" /> Action Taken
                </Badge>
              )}
              {insight.dismissed && (
                <Badge variant="outline" className="text-muted-foreground">
                  Dismissed
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {insight.content}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{format(new Date(insight.created_at), 'MMM d, yyyy')}</span>
              {insight.source_agent && (
                <span className="flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  {insight.source_agent}
                </span>
              )}
              {insight.confidence_score && (
                <span>{Math.round(insight.confidence_score * 100)}% confidence</span>
              )}
            </div>

            {insight.action_taken && insight.action_result && (
              <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                Result: {insight.action_result}
              </div>
            )}
          </div>

          {!insight.action_taken && !insight.dismissed && (
            <div className="flex gap-1">
              {onMarkActionTaken && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMarkActionTaken(insight.id)}
                  className="h-8 w-8 text-green-600 hover:text-green-700"
                  title="Mark action taken"
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDismiss(insight.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}