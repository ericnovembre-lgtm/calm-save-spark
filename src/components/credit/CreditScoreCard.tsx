import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCreditScoreSync } from "@/hooks/useCreditScoreHistory";
import { toast } from "sonner";

interface CreditScoreCardProps {
  score: number;
  change: number;
  provider: string;
  date: string;
  factors?: any[];
}

export const CreditScoreCard = ({ score, change, provider, date, factors }: CreditScoreCardProps) => {
  const queryClient = useQueryClient();
  const syncScore = useCreditScoreSync();
  
  const syncMutation = useMutation({
    mutationFn: syncScore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_score_history'] });
      toast.success('Credit score synced successfully');
    },
    onError: (error) => {
      toast.error('Failed to sync credit score');
      console.error('Sync error:', error);
    },
  });
  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-500';
    if (score >= 740) return 'text-blue-500';
    if (score >= 670) return 'text-yellow-500';
    if (score >= 580) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreRating = (score: number) => {
    if (score >= 800) return 'Exceptional';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };

  const getTrendIcon = () => {
    if (change > 0) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  const lastSyncTime = new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-sm text-muted-foreground">Credit Score</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="h-6 px-2"
        >
          <RefreshCw className={`w-3 h-3 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-6">Last synced: {lastSyncTime}</p>
      
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</h2>
            <Badge variant={change > 0 ? "default" : change < 0 ? "destructive" : "secondary"}>
              {getScoreRating(score)}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${
              change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {change > 0 ? '+' : ''}{change} points
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{provider}</p>
          <p className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString()}</p>
        </div>
      </div>

      {factors && factors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Score Factors</h4>
          <div className="space-y-2">
            {factors.map((factor: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    factor.impact === 'positive' ? 'bg-green-500' :
                    factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm text-foreground">{factor.factor}</span>
                </div>
                <span className="text-xs text-muted-foreground">{factor.weight}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-accent/20 rounded-lg">
        <p className="text-xs text-muted-foreground">
          Your credit score is updated monthly. Maintaining good payment history and low credit utilization are key factors.
        </p>
      </div>
    </Card>
  );
};
