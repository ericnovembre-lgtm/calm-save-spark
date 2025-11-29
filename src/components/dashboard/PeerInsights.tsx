import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Award, Trophy, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

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

  const percentile = Math.min(Math.round((userMonthlySavings / peerAverageSavings) * 100), 100);

  return (
    <Card data-tour="peer-insights" className="p-6 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Community Insights</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        See how you compare to other $ave+ users with similar goals
      </p>

      <div className="space-y-6">
        {/* Animated Comparison Bars */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Your Monthly Savings
              </span>
              <span className="text-sm font-bold text-primary">
                ${Math.round(userMonthlySavings).toLocaleString()}
              </span>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="origin-left"
            >
              <Progress value={percentile} className="h-3" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Community Average
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                ${peerAverageSavings.toLocaleString()}
              </span>
            </div>
            <Progress value={50} className="h-3 opacity-50" />
          </motion.div>
        </div>

        {/* Position Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={`p-4 rounded-lg border ${
            userMonthlySavings > peerAverageSavings
              ? 'bg-primary/10 border-primary/30'
              : 'bg-muted/50 border-border'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              userMonthlySavings > peerAverageSavings
                ? 'bg-primary/20'
                : 'bg-muted'
            }`}>
              <Target className={`w-5 h-5 ${
                userMonthlySavings > peerAverageSavings
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">
                {userMonthlySavings > peerAverageSavings 
                  ? "Above Average! 🎉" 
                  : "Keep Going! 💪"}
              </p>
              <p className="text-xs text-muted-foreground">
                {userMonthlySavings > peerAverageSavings 
                  ? `You're saving ${Math.round(((userMonthlySavings - peerAverageSavings) / peerAverageSavings) * 100)}% more than average`
                  : "Small steps lead to big changes"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Additional Insights */}
        <div className="grid grid-cols-2 gap-3">
          {insights.slice(1).map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="p-3 rounded-lg bg-muted/30 border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {insight.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-foreground">
                    {insight.userValue}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs {insight.peerValue}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {insight.message}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Tips from Top Savers */}
        {userMonthlySavings > peerAverageSavings && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="p-3 rounded-lg bg-primary/5 border border-primary/10"
          >
            <p className="text-xs font-medium text-primary mb-1">💡 Tip from Top Savers</p>
            <p className="text-xs text-muted-foreground">
              Set up automatic transfers on payday to maintain your savings momentum!
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
