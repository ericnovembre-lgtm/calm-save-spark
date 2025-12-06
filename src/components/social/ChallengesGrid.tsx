import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Users, Calendar, Trophy, CheckCircle2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCelebrationTrigger } from "@/hooks/useCelebrationTrigger";
import { motion } from "framer-motion";

export function ChallengesGrid() {
  const queryClient = useQueryClient();
  const { triggerChallengeWinCelebration } = useCelebrationTrigger();
  const processedCompletions = useRef<Set<string>>(new Set());

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const userId = session?.user?.id;

  const { data: challenges } = useQuery({
    queryKey: ['community-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch user's challenge participations
  const { data: participations } = useQuery({
    queryKey: ['user-challenge-participations', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('challenge_id, is_completed, progress')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Real-time subscription for challenge completions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('challenge-completions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'challenge_participants',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;
          const participationId = newData.id;

          // Check if just completed (is_completed changed from false to true)
          if (newData.is_completed && !oldData.is_completed) {
            // Prevent duplicate celebrations
            if (processedCompletions.current.has(participationId)) return;
            processedCompletions.current.add(participationId);

            console.log('[ChallengesGrid] Challenge completed!', newData);

            // Fetch challenge details
            const { data: challenge } = await supabase
              .from('community_challenges')
              .select('*')
              .eq('id', newData.challenge_id)
              .single();

            if (challenge) {
              // Trigger celebration
              triggerChallengeWinCelebration({
                id: challenge.id,
                title: challenge.challenge_name,
                reward_points: challenge.reward_points,
              });

              toast.success(`🎉 Challenge Complete: ${challenge.challenge_name}!`, {
                description: `You earned ${challenge.reward_points} points!`,
              });
            }

            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['user-challenge-participations'] });
            queryClient.invalidateQueries({ queryKey: ['active-challenges-count'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, triggerChallengeWinCelebration, queryClient]);

  const joinChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({ challenge_id: challengeId } as any);

      if (error) throw error;

      toast.success("Joined challenge successfully!");
      queryClient.invalidateQueries({ queryKey: ['user-challenge-participations'] });
      queryClient.invalidateQueries({ queryKey: ['active-challenges-count'] });
    } catch (error: any) {
      toast.error(`Failed to join challenge: ${error.message}`);
    }
  };

  const getParticipation = (challengeId: string) => {
    return participations?.find(p => p.challenge_id === challengeId);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {challenges && challenges.length > 0 ? (
        challenges.map((challenge, index) => {
          const daysLeft = Math.ceil(
            (new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          const participation = getParticipation(challenge.id);
          const isJoined = !!participation;
          const isCompleted = participation?.is_completed;
          const progress = participation?.progress || 0;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-6 relative overflow-hidden ${isCompleted ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}>
                {isCompleted && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-500 text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </Badge>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-orbital ${isCompleted ? 'bg-emerald-500/20' : 'bg-primary/10'}`}>
                        {isCompleted ? (
                          <Trophy className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Target className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold">{challenge.challenge_name}</h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {challenge.challenge_type.replace('_', ' ')}
                    </Badge>
                    <Badge variant="secondary">
                      {challenge.reward_points} points
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {challenge.max_participants ? `${challenge.max_participants} max` : 'Unlimited'}
                      </span>
                    </div>
                    {isJoined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className={isCompleted ? '[&>div]:bg-emerald-500' : ''} />
                      </div>
                    )}
                    {!isJoined && <Progress value={0} />}
                  </div>

                  {!isJoined && daysLeft > 0 && (
                    <Button onClick={() => joinChallenge(challenge.id)} className="w-full">
                      Join Challenge
                    </Button>
                  )}
                  {isJoined && !isCompleted && (
                    <Button variant="outline" className="w-full" disabled>
                      In Progress
                    </Button>
                  )}
                  {isCompleted && (
                    <Button variant="outline" className="w-full border-emerald-500/50 text-emerald-600" disabled>
                      <Trophy className="w-4 h-4 mr-2" />
                      Challenge Won!
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })
      ) : (
        <Card className="p-8 col-span-2">
          <div className="text-center text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active challenges at the moment</p>
            <p className="text-sm mt-1">Check back soon for new challenges!</p>
          </div>
        </Card>
      )}
    </div>
  );
}
