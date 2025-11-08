import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function LeaderboardView() {
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('category', 'total_savings')
        .order('rank', { ascending: true })
        .limit(20);
      
      if (error) throw error;
      return data;
    }
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">Global Leaderboard</h3>
          <p className="text-sm text-muted-foreground">Top savers in the community</p>
        </div>

        <div className="space-y-2">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center font-bold">
                    {getRankIcon(entry.rank) || `#${entry.rank}`}
                  </div>
                  <Avatar>
                    <AvatarFallback>U{entry.rank}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">User {entry.user_id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{entry.category.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${parseFloat(entry.score.toString()).toFixed(2)}</p>
                  <Badge variant="outline" className="text-xs">
                    {entry.leaderboard_type}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Leaderboard will be populated soon</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}