import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, Lightbulb, TrendingUp, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreditTip {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

export function CreditTipsModal({ isOpen, onClose }: CreditTipsModalProps) {
  const { user } = useAuth();
  const [tips, setTips] = useState<CreditTip[]>([]);

  // Fetch credit score data
  const { data: creditData, isLoading: creditLoading } = useQuery({
    queryKey: ['credit-score', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_scores')
        .select('*')
        .eq('user_id', user?.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: isOpen && !!user?.id,
  });

  // Fetch AI-generated tips
  const { data: aiTips, isLoading: tipsLoading } = useQuery({
    queryKey: ['credit-tips', user?.id, creditData?.score],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-credit-tips', {
        body: {
          creditScore: creditData?.score || 650,
          factors: creditData?.factors || {},
        }
      });
      
      if (error) throw error;
      return data.tips as CreditTip[];
    },
    enabled: isOpen && !!user?.id && !creditLoading,
  });

  useEffect(() => {
    if (aiTips) {
      setTips(aiTips);
    } else if (!tipsLoading && !aiTips) {
      // Fallback tips if AI is unavailable
      setTips([
        {
          title: 'Pay bills on time',
          description: 'Payment history is the biggest factor in your credit score. Set up autopay to never miss a due date.',
          impact: 'high',
          category: 'Payment History'
        },
        {
          title: 'Keep credit utilization low',
          description: 'Try to use less than 30% of your available credit. Lower utilization shows responsible credit management.',
          impact: 'high',
          category: 'Credit Utilization'
        },
        {
          title: 'Don\'t close old accounts',
          description: 'Length of credit history matters. Keep older accounts open even if you don\'t use them often.',
          impact: 'medium',
          category: 'Credit Age'
        },
        {
          title: 'Limit new credit applications',
          description: 'Each hard inquiry can temporarily lower your score. Only apply for credit when you really need it.',
          impact: 'low',
          category: 'New Credit'
        },
      ]);
    }
  }, [aiTips, tipsLoading]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-muted-foreground bg-muted/50';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <TrendingUp className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const isLoading = creditLoading || tipsLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-500" />
            Credit Score Tips
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI-powered recommendations to improve your credit
          </DialogDescription>
        </DialogHeader>

        {/* Current Score Display */}
        {creditData && (
          <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/20">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{creditData.score}</p>
              <p className="text-xs text-muted-foreground">Current Score</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {creditData.score >= 750 ? 'Excellent' :
                 creditData.score >= 700 ? 'Good' :
                 creditData.score >= 650 ? 'Fair' : 'Needs Work'}
              </p>
            {creditData.change_from_previous && (
                <p className={cn(
                  "text-xs",
                  creditData.change_from_previous > 0 ? "text-emerald-500" : "text-rose-500"
                )}>
                  {creditData.change_from_previous > 0 ? '+' : ''}{creditData.change_from_previous} pts this month
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tips List */}
        <div className="space-y-3 mt-4">
          {isLoading ? (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          ) : (
            tips.map((tip, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border/50 bg-card/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1.5 rounded-md border",
                      getImpactColor(tip.impact)
                    )}>
                      {getImpactIcon(tip.impact)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground">{tip.category}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full capitalize",
                    getImpactColor(tip.impact)
                  )}>
                    {tip.impact} impact
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
