import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ChallengeManagement() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    challenge_name: "",
    description: "",
    challenge_type: "savings",
    reward_points: "100",
    start_date: "",
    end_date: "",
    max_participants: ""
  });

  const queryClient = useQueryClient();

  const { data: challenges } = useQuery({
    queryKey: ['admin-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_challenges')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createChallenge = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('community_challenges')
        .insert({
          ...data,
          reward_points: parseInt(data.reward_points),
          max_participants: data.max_participants ? parseInt(data.max_participants) : null,
          goal_config: {}
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success("Challenge created successfully");
      setOpen(false);
      setFormData({
        challenge_name: "",
        description: "",
        challenge_type: "savings",
        reward_points: "100",
        start_date: "",
        end_date: "",
        max_participants: ""
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to create challenge: ${error.message}`);
    }
  });

  const deleteChallenge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('community_challenges')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success("Challenge deleted");
    }
  });

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Community Challenges</h3>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Challenge</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                createChallenge.mutate(formData);
              }} className="space-y-4">
                <div>
                  <Label htmlFor="challenge_name">Challenge Name *</Label>
                  <Input
                    id="challenge_name"
                    value={formData.challenge_name}
                    onChange={(e) => setFormData({ ...formData, challenge_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="challenge_type">Type *</Label>
                    <Select 
                      value={formData.challenge_type}
                      onValueChange={(value) => setFormData({ ...formData, challenge_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="savings">Savings Goal</SelectItem>
                        <SelectItem value="spending_reduction">Spending Reduction</SelectItem>
                        <SelectItem value="debt_payoff">Debt Payoff</SelectItem>
                        <SelectItem value="streak">Savings Streak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reward_points">Reward Points *</Label>
                    <Input
                      id="reward_points"
                      type="number"
                      value={formData.reward_points}
                      onChange={(e) => setFormData({ ...formData, reward_points: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="max_participants">Max Participants (optional)</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <Button type="submit" disabled={createChallenge.isPending}>
                  {createChallenge.isPending ? "Creating..." : "Create Challenge"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {challenges && challenges.length > 0 ? (
            challenges.map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <h4 className="font-semibold">{challenge.challenge_name}</h4>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={challenge.is_active ? 'default' : 'secondary'}>
                      {challenge.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {challenge.challenge_type.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{challenge.reward_points} pts</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteChallenge.mutate(challenge.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No challenges created yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}