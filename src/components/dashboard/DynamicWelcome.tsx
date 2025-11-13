import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, TrendingUp, Target } from "lucide-react";

interface DynamicWelcomeProps {
  userName?: string;
}

export const DynamicWelcome = ({ userName }: DynamicWelcomeProps) => {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const userId = session?.user?.id;

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data: transfers } = await supabase
        .from('transfer_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      const completedGoals = goals?.filter(g => 
        parseFloat(String(g.current_amount)) >= parseFloat(String(g.target_amount))
      ).length || 0;

      return {
        lastTransfer: transfers?.[0],
        totalGoals: goals?.length || 0,
        completedGoals,
      };
    },
    enabled: !!userId,
  });

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const getGreetingEmoji = () => {
    const timeOfDay = getTimeOfDay();
    if (timeOfDay === 'morning') return '☀️';
    if (timeOfDay === 'afternoon') return '👋';
    return '🌙';
  };

  const getPersonalizedMessage = () => {
    const timeOfDay = getTimeOfDay();
    const greetings: Record<string, string> = {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    };

    const greeting = greetings[timeOfDay];

    if (!recentActivity) {
      return `${greeting}! Ready to start saving?`;
    }

    if (recentActivity.completedGoals > 0) {
      return `${greeting}! You've completed ${recentActivity.completedGoals} goal${recentActivity.completedGoals > 1 ? 's' : ''} - amazing progress! 🎉`;
    }

    if (recentActivity.lastTransfer) {
      const transferDate = new Date(recentActivity.lastTransfer.created_at);
      const daysSince = Math.floor((Date.now() - transferDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSince === 0) {
        return `${greeting}! Great job on your recent transfer! 💪`;
      } else if (daysSince < 7) {
        return `${greeting}! Keep up the momentum from your recent transfer!`;
      }
    }

    if (recentActivity.totalGoals > 0) {
      return `${greeting}! ${recentActivity.totalGoals} goal${recentActivity.totalGoals > 1 ? 's' : ''} in progress - you're on track!`;
    }

    return `${greeting}! Ready to make today count?`;
  };

  const getMotivationalIcon = () => {
    if (recentActivity?.completedGoals && recentActivity.completedGoals > 0) {
      return <Target className="w-6 h-6 text-green-500" />;
    }
    if (recentActivity?.lastTransfer) {
      const transferDate = new Date(recentActivity.lastTransfer.created_at);
      const daysSince = Math.floor((Date.now() - transferDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 7) {
        return <TrendingUp className="w-6 h-6 text-blue-500" />;
      }
    }
    return <Sparkles className="w-6 h-6 text-yellow-500" />;
  };

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
          {getPersonalizedMessage()}{' '}
          <span className="text-4xl">{getGreetingEmoji()}</span>
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your money today
        </p>
      </div>
      <div className="hidden sm:block p-3 rounded-xl bg-accent/10">
        {getMotivationalIcon()}
      </div>
    </div>
  );
};
