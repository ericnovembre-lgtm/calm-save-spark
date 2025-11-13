import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  action: string;
  actionUrl: string;
  icon: string;
  priority: "high" | "medium" | "low";
}

interface ProactiveRecommendationsProps {
  userId: string;
}

export default function ProactiveRecommendations({ userId }: ProactiveRecommendationsProps) {
  const { data: goals } = useQuery({
    queryKey: ['goals', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    },
  });

  const { data: accounts } = useQuery({
    queryKey: ['connected_accounts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions', userId],
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

  // Generate smart recommendations based on user data
  const recommendations: Recommendation[] = [];

  // Recommendation: Create first goal
  if (!goals || goals.length === 0) {
    recommendations.push({
      id: '1',
      title: 'Set Your First Goal',
      description: 'Start your savings journey by creating a goal. Research shows people who set goals save 3x more.',
      action: 'Create Goal',
      actionUrl: '/goals',
      icon: 'target',
      priority: 'high',
    });
  }

  // Recommendation: Connect account
  if (!accounts || accounts.length === 0) {
    recommendations.push({
      id: '2',
      title: 'Connect Your Bank',
      description: 'Link your bank account to automatically track your progress and enable smart savings.',
      action: 'Connect Account',
      actionUrl: '/dashboard',
      icon: 'trending-up',
      priority: 'high',
    });
  }

  // Recommendation: Goals near completion
  const nearCompletionGoals = goals?.filter(g => {
    const progress = (parseFloat(String(g.current_amount)) / parseFloat(String(g.target_amount))) * 100;
    return progress >= 80 && progress < 100;
  });

  if (nearCompletionGoals && nearCompletionGoals.length > 0) {
    const percentRemaining = Math.round(100 - (parseFloat(String(nearCompletionGoals[0].current_amount)) / parseFloat(String(nearCompletionGoals[0].target_amount))) * 100);
    recommendations.push({
      id: '3',
      title: 'Almost There!',
      description: `You're ${percentRemaining}% away from completing "${nearCompletionGoals[0].name}". One final push!`,
      action: 'Add Funds',
      actionUrl: '/goals',
      icon: 'zap',
      priority: 'high',
    });
  }

  // Recommendation: Consistent saving
  if (transactions && transactions.length > 0) {
    const recentDeposits = transactions.filter(t => parseFloat(String(t.amount)) > 0).slice(0, 5);
    if (recentDeposits.length >= 3) {
      recommendations.push({
        id: '4',
        title: 'Great Momentum!',
        description: "You've made consistent deposits recently. Consider automating your savings to make it even easier.",
        action: 'Set Up Automation',
        actionUrl: '/automations',
        icon: 'trending-up',
        priority: 'medium',
      });
    }
  }

  // Fallback recommendation
  if (recommendations.length === 0) {
    recommendations.push({
      id: '5',
      title: 'Explore Features',
      description: 'Discover all the tools $ave+ offers to help you reach your financial goals faster.',
      action: 'Learn More',
      actionUrl: '/help',
      icon: 'lightbulb',
      priority: 'low',
    });
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'target': return Target;
      case 'trending-up': return TrendingUp;
      case 'zap': return Zap;
      default: return Lightbulb;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-accent';
      case 'medium': return 'border-l-4 border-l-primary';
      case 'low': return 'border-l-4 border-l-muted';
      default: return '';
    }
  };

  return (
    <div className="space-y-3">
      {recommendations.slice(0, 3).map((rec, index) => {
        const Icon = getIcon(rec.icon);
        return (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 hover:shadow-md transition-all ${getPriorityColor(rec.priority)}`}>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                  <Button asChild size="sm" variant="default">
                    <Link to={rec.actionUrl}>{rec.action}</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
