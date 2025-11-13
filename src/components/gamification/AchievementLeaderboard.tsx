import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Medal, Award, Crown, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function AchievementLeaderboard() {
  const [view, setView] = useState<"global" | "friends">("global");

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["achievement-leaderboard", view],
    queryFn: async () => {
      if (view === "global") {
        const { data, error } = await supabase
          .from("achievement_leaderboard")
          .select("*")
          .order("rank", { ascending: true })
          .limit(100);

        if (error) throw error;
        return data;
      } else {
        // For friends view, we'd need a friends table
        // For now, just show top 10 as placeholder
        const { data, error } = await supabase
          .from("achievement_leaderboard")
          .select("*")
          .order("rank", { ascending: true })
          .limit(10);

        if (error) throw error;
        return data;
      }
    },
  });

  const { data: userRank } = useQuery({
    queryKey: ["user-rank", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;

      const { data, error } = await supabase
        .from("achievement_leaderboard")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!currentUser,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Achievement Leaderboard
        </CardTitle>
        <CardDescription>
          See how you rank against other savers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {userRank && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(userRank.rank)}
                </div>
                <div>
                  <div className="font-semibold text-foreground">Your Rank</div>
                  <div className="text-sm text-muted-foreground">
                    {userRank.total_achievements} achievements • {userRank.total_points} points
                  </div>
                </div>
              </div>
              {userRank.current_streak > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {userRank.current_streak} day streak
                </Badge>
              )}
            </div>
          </div>
        )}

        <Tabs value={view} onValueChange={(v) => setView(v as "global" | "friends")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-2 mt-4">
            {leaderboard?.map((entry, index) => (
              <div
                key={entry.user_id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  entry.user_id === currentUser?.id
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(entry.rank)}
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.avatar_url || undefined} />
                  <AvatarFallback>
                    {entry.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {entry.full_name || "Anonymous"}
                    {entry.user_id === currentUser?.id && (
                      <span className="text-xs text-primary ml-2">(You)</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.total_achievements} achievements
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-lg text-foreground">
                    {entry.total_points}
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>

                {entry.current_streak > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {entry.current_streak}
                  </Badge>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="friends" className="space-y-2 mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">Friends leaderboard coming soon!</p>
              <p className="text-sm">Connect with friends to compete together</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
