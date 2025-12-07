import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, PiggyBank, Target, Flame, TrendingUp, Zap, Users } from "lucide-react";
import { AchievementBadge } from "./AchievementBadge";

const categoryIcons: Record<string, any> = {
  savings_mastery: PiggyBank,
  goal_achiever: Target,
  streak_champion: Flame,
  financial_wellness: TrendingUp,
  automation_expert: Zap,
  community_champion: Users,
};

const categoryColors: Record<string, string> = {
  savings_mastery: "text-green-500",
  goal_achiever: "text-amber-500",
  streak_champion: "text-orange-500",
  financial_wellness: "text-amber-600",
  automation_expert: "text-yellow-500",
  community_champion: "text-pink-500",
};

export function AchievementCollections() {
  const { data: collections, isLoading: loadingCollections } = useQuery({
    queryKey: ["achievement-collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievement_collections")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: achievements, isLoading: loadingAchievements } = useQuery({
    queryKey: ["achievements-by-category"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("points", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: userAchievements } = useQuery({
    queryKey: ["user-achievements-collections"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_achievements")
        .select("achievement_id, earned_at")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  if (loadingCollections || loadingAchievements) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

  const getCollectionProgress = (category: string) => {
    const categoryAchievements = achievements?.filter(a => a.category === category) || [];
    const earnedInCategory = categoryAchievements.filter(a => earnedIds.has(a.id)).length;
    const total = categoryAchievements.length;
    const percentage = total > 0 ? (earnedInCategory / total) * 100 : 0;

    return {
      earned: earnedInCategory,
      total,
      percentage,
      achievements: categoryAchievements,
    };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections?.map((collection) => {
          const progress = getCollectionProgress(collection.category);
          const Icon = categoryIcons[collection.category] || Target;
          const colorClass = categoryColors[collection.category] || "text-primary";
          const isCompleted = progress.percentage === 100;

          return (
            <Card key={collection.id} className="relative overflow-hidden">
              {isCompleted && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    ✓ Complete
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-muted ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                  </div>
                </div>
                <CardDescription>{collection.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-foreground">
                      {progress.earned} / {progress.total}
                    </span>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground text-right">
                    {progress.percentage.toFixed(0)}% complete
                  </div>
                </div>

                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-primary hover:underline list-none">
                    View Achievements
                  </summary>
                  <div className="mt-4 space-y-3">
                    {progress.achievements.map((achievement) => {
                      const isEarned = earnedIds.has(achievement.id);
                      const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id);
                      
                      return (
                        <div key={achievement.id} className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className={isEarned ? "text-green-600" : "text-muted-foreground"}>
                              {isEarned ? "✓" : "○"}
                            </span>
                            <span className={isEarned ? "text-foreground" : "text-muted-foreground"}>
                              {achievement.name}
                            </span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {achievement.points} pts
                            </Badge>
                          </div>
                          {achievement.freeze_day_reward > 0 && (
                            <div className="ml-6 text-xs text-amber-600">
                              🎁 Reward: {achievement.freeze_day_reward} freeze day{achievement.freeze_day_reward > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </details>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
