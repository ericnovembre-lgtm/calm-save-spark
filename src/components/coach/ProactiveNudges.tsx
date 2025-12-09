import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, Target, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface Nudge {
  id: string;
  title: string;
  description: string;
  type: 'savings' | 'spending' | 'goal' | 'debt';
  priority: 'high' | 'medium' | 'low';
  suggested_action: {
    label: string;
    action: string;
  };
}

interface ProactiveNudgesProps {
  userId: string;
  onNudgeAction: (nudge: Nudge) => void;
}

export function ProactiveNudges({ userId, onNudgeAction }: ProactiveNudgesProps) {
  const { data: nudges, isLoading } = useQuery({
    queryKey: ['proactive-nudges', userId],
    queryFn: async () => {
      // Fetch user's financial data to generate nudges
      const [goalsRes, debtsRes, transactionsRes] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('debts').select('*').eq('user_id', userId),
        supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }).limit(30)
      ]);

      const generatedNudges: Nudge[] = [];

      // Goal-based nudges
      const activeGoals = goalsRes.data || [];
      activeGoals.forEach(goal => {
        const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
        if (progress > 75 && progress < 95) {
          generatedNudges.push({
            id: `goal-${goal.id}`,
            title: `Almost there with ${goal.name}!`,
            description: `You're ${progress.toFixed(0)}% towards your goal. Just $${(Number(goal.target_amount) - Number(goal.current_amount)).toFixed(2)} to go!`,
            type: 'goal',
            priority: 'high',
            suggested_action: {
              label: 'Boost savings',
              action: `increase savings for ${goal.name}`
            }
          });
        }
      });

      // Spending pattern nudges
      const recentTransactions = transactionsRes.data || [];
      const last7Days = recentTransactions.filter(t => {
        const daysSince = (Date.now() - new Date(t.transaction_date).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      });
      
      const totalSpent7Days = last7Days.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
      if (totalSpent7Days > 500) {
        generatedNudges.push({
          id: 'spending-high',
          title: 'Higher spending detected',
          description: `You've spent $${totalSpent7Days.toFixed(2)} in the last 7 days`,
          type: 'spending',
          priority: 'medium',
          suggested_action: {
            label: 'Review spending',
            action: 'analyze my spending patterns'
          }
        });
      }

      // Debt nudges
      const activeDebts = debtsRes.data?.filter(d => d.status === 'active') || [];
      if (activeDebts.length > 0) {
        const totalDebt = activeDebts.reduce((sum, d) => sum + Number(d.current_balance), 0);
        generatedNudges.push({
          id: 'debt-alert',
          title: 'Debt payoff opportunity',
          description: `You have $${totalDebt.toFixed(2)} in active debt`,
          type: 'debt',
          priority: 'high',
          suggested_action: {
            label: 'Create payoff plan',
            action: 'help me create a debt payoff strategy'
          }
        });
      }

      return generatedNudges.slice(0, 3); // Return top 3 nudges
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  if (isLoading || !nudges || nudges.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'goal': return Target;
      case 'spending': return TrendingUp;
      case 'debt': return DollarSign;
      default: return Lightbulb;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'border-amber-500 bg-amber-50 dark:bg-amber-900/20';
      default: return 'border-accent bg-accent/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Lightbulb className="h-4 w-4" />
        Insights for You
      </h3>
      
      {nudges.map(nudge => {
        const Icon = getIcon(nudge.type);
        return (
          <Card key={nudge.id} className={`p-4 border-l-4 ${getPriorityColor(nudge.priority)}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-lg bg-background/50">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground">{nudge.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{nudge.description}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNudgeAction(nudge)}
                className="text-xs shrink-0"
              >
                {nudge.suggested_action.label}
              </Button>
            </div>
          </Card>
        );
      })}
    </motion.div>
  );
}
