import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Repeat, 
  DollarSign, 
  Calendar,
  Sparkles,
  MapPin,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface TransactionDetectiveProps {
  transactionId: string;
  merchant: string;
  amount: number;
  category: string;
}

interface AnalysisResult {
  insights: string;
  pattern: 'recurring' | 'one-time' | 'irregular';
  spending_context: {
    avg_amount: number;
    percentile: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  recurring_info?: {
    frequency: string;
    next_expected?: string;
    confidence: number;
  };
}

export function TransactionDetective({
  transactionId,
  merchant,
  amount,
  category,
}: TransactionDetectiveProps) {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ['transaction-analysis', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-transaction', {
        body: { transactionId, merchant, amount, category }
      });
      if (error) throw error;
      return data as AnalysisResult;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3 pt-4 border-t border-border">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 pt-4 border-t border-border"
    >
      {/* AI Insights */}
      <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-accent mb-1 uppercase tracking-wide">
              AI Analysis
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {analysis.insights}
            </p>
          </div>
        </div>
      </div>

      {/* Pattern Detection */}
      {analysis.pattern === 'recurring' && analysis.recurring_info && (
        <div className="p-3 bg-success/5 border border-success/20 rounded-xl">
          <div className="flex items-start gap-2">
            <Repeat className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-success mb-1 uppercase tracking-wide">
                Recurring Pattern Detected
              </div>
              <div className="space-y-1">
                <p className="text-sm text-foreground">
                  <span className="font-medium">Frequency:</span> {analysis.recurring_info.frequency}
                </p>
                {analysis.recurring_info.next_expected && (
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Next Expected:</span>{' '}
                    {format(new Date(analysis.recurring_info.next_expected), 'MMM dd, yyyy')}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success rounded-full transition-all"
                      style={{ width: `${analysis.recurring_info.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-success font-medium">
                    {(analysis.recurring_info.confidence * 100).toFixed(0)}% confident
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spending Context */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-background/50 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-3 h-3 text-foreground/60" />
            <span className="text-xs text-muted-foreground">Average</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            ${analysis.spending_context.avg_amount.toFixed(2)}
          </div>
        </div>

        <div className="p-3 bg-background/50 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 text-foreground/60" />
            <span className="text-xs text-muted-foreground">Your Percentile</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {analysis.spending_context.percentile}%
          </div>
        </div>
      </div>

      {/* Trend Badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Spending Trend:</span>
        <Badge 
          variant={
            analysis.spending_context.trend === 'increasing' ? 'destructive' :
            analysis.spending_context.trend === 'decreasing' ? 'default' :
            'secondary'
          }
          className="text-xs"
        >
          {analysis.spending_context.trend === 'increasing' && '📈 Increasing'}
          {analysis.spending_context.trend === 'decreasing' && '📉 Decreasing'}
          {analysis.spending_context.trend === 'stable' && '➡️ Stable'}
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" className="text-xs">
          <FileText className="w-3 h-3 mr-1" />
          Add Note
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <MapPin className="w-3 h-3 mr-1" />
          View Location
        </Button>
      </div>
    </motion.div>
  );
}
