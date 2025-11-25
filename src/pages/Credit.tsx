import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";
import { NeonCreditGauge } from '@/components/credit/NeonCreditGauge';
import { CreditSimulator } from '@/components/credit/CreditSimulator';
import { CreditFactorBars } from '@/components/credit/CreditFactorBars';
import { ApprovalPowerCard } from '@/components/credit/ApprovalPowerCard';
import { ForensicScanCard } from '@/components/credit/ForensicScanCard';
import { LimitLiftScriptCard } from '@/components/credit/LimitLiftScriptCard';
import { InquiryDetectiveCard } from '@/components/credit/InquiryDetectiveCard';
import { DisputeWizardCard } from '@/components/credit/DisputeWizardCard';
import { AZEOStrategistCard } from '@/components/credit/AZEOStrategistCard';
import { GoodwillGhostwriterCard } from '@/components/credit/GoodwillGhostwriterCard';
import { ClosureSimulatorCard } from '@/components/credit/ClosureSimulatorCard';
import { CreditScoreHistoryChart } from '@/components/credit/CreditScoreHistoryChart';

export default function Credit() {
  const queryClient = useQueryClient();
  const [projectedScore, setProjectedScore] = useState<number | undefined>(undefined);

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

  if (isLoading) return <LoadingState />;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[hsl(var(--cyber-bg))] text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-display font-bold text-foreground mb-2">
                Credit Command Center
              </h1>
              <p className="text-muted-foreground">
                Predict, protect, and optimize your credit health
              </p>
            </div>
            <Button 
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              variant="outline"
              className="border-[hsl(var(--cyber-green))] text-[hsl(var(--cyber-green))] hover:bg-[hsl(var(--cyber-green))]/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              Update Score
            </Button>
          </div>

          {latestScore ? (
            <>
              {/* Hero: Neon Gauge */}
              <Card className="p-8 backdrop-blur-glass bg-[hsl(var(--cyber-surface))]/50 border-[hsl(var(--cyber-border))]">
                <NeonCreditGauge 
                  score={latestScore.score} 
                  projectedScore={projectedScore}
                />
              </Card>

              {/* Credit Score History Chart */}
              <CreditScoreHistoryChart />

              {/* Two-Column Layout: Simulator + AI Coach */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <CreditSimulator 
                    currentScore={latestScore.score}
                    onProjectedScoreChange={setProjectedScore}
                  />
                  <CreditFactorBars />
                </div>

                <div className="space-y-6">
                  <div className="backdrop-blur-glass bg-[hsl(var(--cyber-surface))]/50 border border-[hsl(var(--cyber-border))] rounded-lg p-6">
                    <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                      AI Credit Coach
                    </h2>
                    <div className="space-y-4">
                      <ApprovalPowerCard currentScore={latestScore.score} />
                      <ForensicScanCard currentScore={latestScore.score} />
                      <LimitLiftScriptCard />
                      <InquiryDetectiveCard />
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Repair Tools Section */}
              <div className="backdrop-blur-glass bg-[hsl(var(--cyber-surface))]/50 border border-[hsl(var(--cyber-border))] rounded-lg p-6">
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                  Credit Repair Tools
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <DisputeWizardCard />
                  <AZEOStrategistCard />
                  <GoodwillGhostwriterCard />
                  <ClosureSimulatorCard />
                </div>
              </div>
            </>
          ) : (
            <Card className="p-12 text-center backdrop-blur-glass bg-[hsl(var(--cyber-surface))]/50 border-[hsl(var(--cyber-border))]">
              <p className="text-muted-foreground mb-4">No credit score data yet</p>
              <Button 
                onClick={() => syncMutation.mutate()} 
                disabled={syncMutation.isPending}
                className="bg-[hsl(var(--cyber-green))] hover:bg-[hsl(var(--cyber-green))]/90"
              >
                Get Your Credit Score
              </Button>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
