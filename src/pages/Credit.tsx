import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { CreditScoreCard } from "@/components/credit/CreditScoreCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";
import { SyncStatusBadge } from "@/components/ui/SyncStatusBadge";
import { LazyLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from '@/components/charts/LazyLineChart';
import { format } from 'date-fns';

export default function Credit() {
  const queryClient = useQueryClient();

  const { data: scores, isLoading } = useQuery({
    queryKey: ['credit_scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_scores')
        .select('*')
        .order('score_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/credit-score-sync`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['credit_scores'] });
      toast.success(`Credit score updated: ${data.score}${data.change ? ` (${data.change > 0 ? '+' : ''}${data.change})` : ''}`);
    },
  });

  const latestScore = scores?.[0];
  const historicalData = scores?.slice().reverse().map(s => ({
    date: format(new Date(s.score_date), 'MMM dd'),
    score: s.score
  }));

  if (isLoading) return <LoadingState />;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Credit Score</h1>
            <p className="text-muted-foreground">Monitor your credit health and track improvements</p>
          </div>
          <Button 
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Update Score
          </Button>
        </div>

        {latestScore ? (
          <div className="space-y-4">
            <CreditScoreCard
              score={latestScore.score}
              change={latestScore.change_from_previous || 0}
              provider={latestScore.provider}
              date={latestScore.score_date}
              factors={latestScore.factors as any[]}
            />
            <Card className="p-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <SyncStatusBadge 
                lastSynced={latestScore.score_date}
                isSyncing={syncMutation.isPending}
                syncType="credit score"
              />
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No credit score data yet</p>
            <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
              Get Your Credit Score
            </Button>
          </Card>
        )}

        {historicalData && historicalData.length > 1 && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Credit Score History</h3>
            <LazyLineChart data={historicalData} height={300}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                domain={[300, 850]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LazyLineChart>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <h4 className="text-sm font-semibold text-foreground mb-4">What Affects Your Score</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment History</span>
                <span className="font-medium text-foreground">35%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Credit Utilization</span>
                <span className="font-medium text-foreground">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Credit Age</span>
                <span className="font-medium text-foreground">15%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Credit Mix</span>
                <span className="font-medium text-foreground">10%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">New Credit</span>
                <span className="font-medium text-foreground">10%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-sm font-semibold text-foreground mb-4">Score Ranges</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-green-500">Exceptional</span>
                <span className="text-muted-foreground">800-850</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-500">Very Good</span>
                <span className="text-muted-foreground">740-799</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-500">Good</span>
                <span className="text-muted-foreground">670-739</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-500">Fair</span>
                <span className="text-muted-foreground">580-669</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-500">Poor</span>
                <span className="text-muted-foreground">300-579</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-sm font-semibold text-foreground mb-4">Improvement Tips</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Pay all bills on time</li>
              <li>• Keep credit utilization below 30%</li>
              <li>• Don't close old accounts</li>
              <li>• Limit new credit applications</li>
              <li>• Regularly check for errors</li>
            </ul>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
