import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AchievementBadge } from "./AchievementBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export function AchievementsList() {
  const { data: userAchievements, isLoading: loadingUser } = useQuery({
    queryKey: ["userAchievements"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_achievements")
        .select(`
          *,
          achievements (
            id,
            name,
            description,
            icon,
            badge_color,
            points
          )
        `)
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: allAchievements, isLoading: loadingAll } = useQuery({
    queryKey: ["allAchievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("points", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (loadingUser || loadingAll) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
  const earnedAchievements = userAchievements?.map(ua => ({
    ...ua.achievements,
    earnedAt: ua.earned_at,
  })) || [];
  
  const lockedAchievements = allAchievements?.filter(a => !earnedIds.has(a.id)) || [];

  const totalPoints = earnedAchievements.reduce((sum, a) => sum + (a.points || 0), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Achievement Stats</CardTitle>
          <CardDescription>Track your progress and accomplishments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{earnedAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {allAchievements ? Math.round((earnedAchievements.length / allAchievements.length) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Completion</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="earned" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="earned">Earned ({earnedAchievements.length})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({lockedAchievements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="earned" className="mt-6">
          {earnedAchievements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No achievements earned yet. Start saving to unlock them!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  icon={achievement.icon}
                  badgeColor={achievement.badge_color}
                  points={achievement.points}
                  earnedAt={achievement.earnedAt}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="locked" className="mt-6">
          {lockedAchievements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">You've unlocked all achievements! 🎉</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  icon={achievement.icon}
                  badgeColor={achievement.badge_color}
                  points={achievement.points}
                  locked
                  achievementId={achievement.id}
                  achievementType={achievement.achievement_type}
                  requirement={achievement.requirement}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
