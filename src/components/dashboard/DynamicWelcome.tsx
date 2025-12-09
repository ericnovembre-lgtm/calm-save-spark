import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Sun, Hand, Moon } from "lucide-react";
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

  const getGreetingIcon = () => {
    const timeOfDay = getTimeOfDay();
    if (timeOfDay === 'morning') return Sun;
    if (timeOfDay === 'afternoon') return Hand;
    return Moon;
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
      return { greeting, message: "Ready to start saving?" };
    }

    if (recentActivity.completedGoals > 0) {
      return { 
        greeting, 
        message: `You've completed ${recentActivity.completedGoals} goal${recentActivity.completedGoals > 1 ? 's' : ''} - amazing progress!` 
      };
    }

    if (recentActivity.lastTransfer) {
      const transferDate = new Date(recentActivity.lastTransfer.created_at);
      const daysSince = Math.floor((Date.now() - transferDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSince === 0) {
        return { greeting, message: "Great job on your recent transfer!" };
      } else if (daysSince < 7) {
        return { greeting, message: "Keep up the momentum from your recent transfer!" };
      }
    }

    if (recentActivity.totalGoals > 0) {
      return { 
        greeting, 
        message: `${recentActivity.totalGoals} goal${recentActivity.totalGoals > 1 ? 's' : ''} in progress - you're on track!` 
      };
    }

    return { greeting, message: "Ready to make today count?" };
  };

  const getMotivationalIcon = () => {
    if (recentActivity?.completedGoals && recentActivity.completedGoals > 0) {
      return <Target className="w-6 h-6 text-green-500" />;
    }
    if (recentActivity?.lastTransfer) {
      const transferDate = new Date(recentActivity.lastTransfer.created_at);
      const daysSince = Math.floor((Date.now() - transferDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 7) {
        return <TrendingUp className="w-6 h-6 text-amber-500" />;
      }
    }
    return <Sparkles className="w-6 h-6 text-yellow-500" />;
  };

  const prefersReducedMotion = useReducedMotion();
  const { greeting, message } = getPersonalizedMessage();
  const GreetingIcon = getGreetingIcon();

  return (
    <motion.div 
      className="flex items-start justify-between"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <motion.div
            initial={prefersReducedMotion ? false : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <GreetingIcon className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.h1 
            className="text-3xl sm:text-4xl font-bold text-foreground"
            initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {greeting}
          </motion.h1>
        </div>
        <motion.p 
          className="text-lg text-muted-foreground mb-1"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {message}
        </motion.p>
        <motion.p 
          className="text-sm text-muted-foreground"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          Here's what's happening with your money today
        </motion.p>
      </div>
      <motion.div 
        className="hidden sm:block p-3 rounded-xl bg-accent/10 transition-all hover:bg-accent/20 hover:scale-105"
        initial={prefersReducedMotion ? false : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {getMotivationalIcon()}
      </motion.div>
    </motion.div>
  );
};
