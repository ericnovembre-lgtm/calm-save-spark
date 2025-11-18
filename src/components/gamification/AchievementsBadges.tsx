import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Lock, Star, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function AchievementsBadges() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['user_achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements:achievement_id (
            name,
            description,
            icon,
            badge_color,
            points,
            freeze_day_reward
          )
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: availableAchievements = [] } = useQuery({
    queryKey: ['available_achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      const { error } = await supabase
        .from('user_achievements')
        .update({ 
          metadata: { claimed: true, claimed_at: new Date().toISOString() }
        })
        .eq('achievement_id', achievementId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_achievements'] });
      toast.success('Reward claimed! 🎉');
    },
  });

  const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));
  const totalPoints = userAchievements
    .filter(ua => (ua.metadata as any)?.claimed)
    .reduce((sum, ua) => sum + (ua.achievements?.points || 0), 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold">Achievements</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          <Star className="w-3 h-3" />
          {totalPoints} Points
        </Badge>
      </div>

      <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Progress</p>
            <p className="text-xs text-muted-foreground">
              {unlockedIds.size} of {availableAchievements.length} unlocked
            </p>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {Math.round((unlockedIds.size / availableAchievements.length) * 100)}%
          </div>
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedIds.size / availableAchievements.length) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {availableAchievements.map((achievement) => {
            const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
            const isUnlocked = unlockedIds.has(achievement.id);
            const isClaimed = (userAchievement?.metadata as any)?.claimed;

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-yellow-500/20' 
                    : 'bg-muted/30 border-border/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    isUnlocked ? 'bg-yellow-500 text-white' : 'bg-muted'
                  }`}>
                    {isUnlocked ? (
                      <Trophy className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-semibold ${!isUnlocked && 'text-muted-foreground'}`}>
                          {achievement.name}
                        </h4>
                        <p className={`text-sm ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {achievement.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {achievement.points} pts
                      </Badge>
                    </div>

                    {isUnlocked && userAchievement && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Unlocked {new Date(userAchievement.earned_at).toLocaleDateString()}
                        </p>
                        {!isClaimed && achievement.freeze_day_reward && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => claimRewardMutation.mutate(achievement.id)}
                            disabled={claimRewardMutation.isPending}
                            className="gap-1"
                          >
                            <Gift className="w-3 h-3" />
                            Claim Reward
                          </Button>
                        )}
                        {isClaimed && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            ✓ Claimed
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
