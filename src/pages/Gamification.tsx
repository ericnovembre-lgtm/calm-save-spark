import { AppLayout } from "@/components/layout/AppLayout";
import { StreakTracker } from "@/components/gamification/StreakTracker";
import { AchievementsBadges } from "@/components/gamification/AchievementsBadges";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { ChallengesPanel } from "@/components/gamification/ChallengesPanel";
import { SavingsGoalVisualization } from "@/components/gamification/SavingsGoalVisualization";
import { WeeklyRecap } from "@/components/gamification/WeeklyRecap";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Flame } from "lucide-react";

export default function Gamification() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['user_goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('id, name, target_amount, current_amount, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gamification Hub</h1>
            <p className="text-muted-foreground">Track your progress, earn rewards, and compete with others</p>
          </div>
        </div>

        {/* Top Row: Streak, Achievements, Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StreakTracker />
          <AchievementsBadges />
          <Leaderboard />
        </div>

        {/* Middle Row: Challenges and Weekly Recap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChallengesPanel />
          <WeeklyRecap />
        </div>

        {/* Bottom Row: Savings Goals Visualization */}
        {goals.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Active Goals Progress
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {goals.slice(0, 4).map((goal) => (
                <SavingsGoalVisualization key={goal.id} goalId={goal.id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
