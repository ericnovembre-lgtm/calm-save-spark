import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, Users, Calendar, Trophy, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export function ChallengesPanel() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['community_challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['challenge_participations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          challenge:challenge_id (
            challenge_name,
            challenge_type,
            end_date,
            goal_config
          )
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          progress: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge_participations'] });
      toast.success('Joined challenge! 🎯');
    },
  });

  const participatingIds = new Set(participations.map(p => p.challenge_id));

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-semibold">Active Challenges</h3>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {/* Active Participations */}
          {participations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Your Challenges</h4>
              <div className="space-y-3">
                {participations.map((participation) => {
                  const challenge = participation.challenge;
                  const daysLeft = Math.ceil(
                    (new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <motion.div
                      key={participation.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-primary/10 to-yellow-500/10 rounded-lg border border-primary/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-semibold">{challenge.challenge_name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {daysLeft} days left
                            </Badge>
                            {participation.is_completed && (
                              <Badge className="bg-green-500 text-white text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{participation.progress}%</span>
                        </div>
                        <Progress value={participation.progress} className="h-2" />

                        {participation.current_streak && participation.current_streak > 0 && (
                          <div className="flex items-center gap-1 text-sm text-orange-600">
                            🔥 {participation.current_streak} day streak
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Challenges */}
          <div>
            <h4 className="text-sm font-medium mb-3">Available Challenges</h4>
            <div className="space-y-3">
              {challenges.map((challenge) => {
                const isParticipating = participatingIds.has(challenge.id);
                const startDate = new Date(challenge.start_date);
                const endDate = new Date(challenge.end_date);
                const hasStarted = startDate <= new Date();

                return (
                  <Card key={challenge.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-semibold">{challenge.challenge_name}</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          {challenge.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {challenge.challenge_type}
                          </Badge>
                          {challenge.reward_points && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Trophy className="w-3 h-3" />
                              {challenge.reward_points} pts
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs text-muted-foreground">
                        {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                      </div>
                      {!isParticipating && hasStarted && (
                        <Button
                          size="sm"
                          onClick={() => joinChallengeMutation.mutate(challenge.id)}
                          disabled={joinChallengeMutation.isPending}
                        >
                          Join Challenge
                        </Button>
                      )}
                      {isParticipating && (
                        <Badge variant="outline" className="bg-primary/10">
                          Participating
                        </Badge>
                      )}
                      {!hasStarted && (
                        <Badge variant="outline">Starts {format(startDate, 'MMM d')}</Badge>
                      )}
                    </div>
                  </Card>
                );
              })}

              {challenges.length === 0 && (
                <Card className="p-8 text-center">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active challenges at the moment</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Check back soon for new challenges!
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
