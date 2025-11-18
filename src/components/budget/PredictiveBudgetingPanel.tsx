import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, AlertCircle, Sparkles } from "lucide-react";

interface PredictiveBudgetingPanelProps {
  budgetId: string;
}

export function PredictiveBudgetingPanel({ budgetId }: PredictiveBudgetingPanelProps) {
  const [period, setPeriod] = useState<'next_week' | 'next_month' | 'next_quarter'>('next_month');

  const { data: prediction, isLoading, refetch } = useQuery({
    queryKey: ['spending_prediction', budgetId, period],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('predictive-budgeting', {
        body: { budgetId, period }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!budgetId,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const confidenceColor = {
    high: 'bg-green-500',
    medium: 'bg-yellow-500',
    low: 'bg-red-500'
  }[prediction?.confidence || 'low'];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Spending Prediction</h3>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={period === 'next_week' ? 'default' : 'outline'}
            onClick={() => setPeriod('next_week')}
          >
            Next Week
          </Button>
          <Button
            size="sm"
            variant={period === 'next_month' ? 'default' : 'outline'}
            onClick={() => setPeriod('next_month')}
          >
            Next Month
          </Button>
          <Button
            size="sm"
            variant={period === 'next_quarter' ? 'default' : 'outline'}
            onClick={() => setPeriod('next_quarter')}
          >
            Next Quarter
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : prediction ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Predicted Spending</p>
              <p className="text-3xl font-bold">${prediction.predictedAmount.toFixed(2)}</p>
            </div>
            <Badge className={`${confidenceColor} text-white`}>
              {prediction.confidence} confidence
            </Badge>
          </div>

          {prediction.factors && prediction.factors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Key Factors</h4>
              <ul className="space-y-1">
                {prediction.factors.map((factor: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {prediction.recommendation && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{prediction.recommendation}</p>
              </div>
            </div>
          )}

          {prediction.source && (
            <p className="text-xs text-muted-foreground text-right">
              Source: {prediction.source === 'cache' ? 'Cached' : 'AI Generated'}
            </p>
          )}

          <Button
            onClick={() => refetch()}
            variant="outline"
            className="w-full gap-2"
            size="sm"
          >
            <TrendingUp className="w-4 h-4" />
            Refresh Prediction
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Unable to generate prediction</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      )}
    </Card>
  );
}
