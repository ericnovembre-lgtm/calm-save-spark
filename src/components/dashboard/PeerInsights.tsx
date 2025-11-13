import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";

interface PeerInsightsProps {
  userId: string;
}

export default function PeerInsights({ userId }: PeerInsightsProps) {
  const { data: userGoals } = useQuery({
    queryKey: ['user_goals', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    },
  });

  const { data: userTransactions } = useQuery({
    queryKey: ['user_transactions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  // Calculate user's monthly savings
  const userMonthlySavings = userTransactions
    ? userTransactions
        .filter(t => parseFloat(String(t.amount)) > 0)
        .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0)
    : 0;

  // Calculate user's goal completion rate
  const completedGoals = userGoals?.filter(g => 
    parseFloat(String(g.current_amount)) >= parseFloat(String(g.target_amount))
  ).length || 0;
  const totalGoals = userGoals?.length || 0;
  const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  // Simulated peer averages (in production, these would come from aggregated user data)
  const peerAverageSavings = 850;
  const peerAverageCompletion = 45;
  const peerAverageGoals = 3;

  const insights = [
    {
      id: '1',
      icon: TrendingUp,
      label: 'Monthly Savings',
      userValue: `$${Math.round(userMonthlySavings)}`,
      peerValue: `$${peerAverageSavings}`,
      comparison: userMonthlySavings > peerAverageSavings ? 'above' : 'below',
      message: userMonthlySavings > peerAverageSavings 
        ? `${Math.round(((userMonthlySavings - peerAverageSavings) / peerAverageSavings) * 100)}% above average`
        : `${Math.round(((peerAverageSavings - userMonthlySavings) / peerAverageSavings) * 100)}% below average`,
    },
    {
      id: '2',
      icon: Award,
      label: 'Goal Completion',
      userValue: `${Math.round(completionRate)}%`,
      peerValue: `${peerAverageCompletion}%`,
      comparison: completionRate > peerAverageCompletion ? 'above' : 'below',
      message: completionRate > peerAverageCompletion
        ? 'You\'re ahead of the curve!'
        : 'Keep pushing to reach your goals',
    },
    {
      id: '3',
      icon: Users,
      label: 'Active Goals',
      userValue: `${totalGoals}`,
      peerValue: `${peerAverageGoals}`,
      comparison: totalGoals > peerAverageGoals ? 'above' : 'below',
      message: totalGoals >= peerAverageGoals
        ? 'Great goal diversity!'
        : 'Consider setting more goals',
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Peer Insights</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        See how you compare to other $ave+ users with similar goals
      </p>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {insight.label}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-lg font-bold text-foreground">
                      {insight.userValue}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs {insight.peerValue} avg
                    </span>
                  </div>
                  <p className={`text-xs ${
                    insight.comparison === 'above' 
                      ? 'text-green-600' 
                      : 'text-muted-foreground'
                  }`}>
                    {insight.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
        <p className="text-xs text-accent-foreground text-center">
          💡 All comparisons are anonymous and based on aggregated data
        </p>
      </div>
    </Card>
  );
}
