import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Users, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ChallengesGrid() {
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

  const joinChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({ challenge_id: challengeId } as any);

      if (error) throw error;

      toast.success("Joined challenge successfully!");
    } catch (error: any) {
      toast.error(`Failed to join challenge: ${error.message}`);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {challenges && challenges.length > 0 ? (
        challenges.map((challenge) => {
          const daysLeft = Math.ceil(
            (new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          return (
            <Card key={challenge.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-orbital bg-primary/10">
                      <Target className="w-5 h-5 text-primary" />
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
                      {daysLeft} days left
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {challenge.max_participants ? `${challenge.max_participants} max` : 'Unlimited'}
                    </span>
                  </div>
                  <Progress value={30} />
                </div>

                <Button onClick={() => joinChallenge(challenge.id)} className="w-full">
                  Join Challenge
                </Button>
              </div>
            </Card>
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