import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Target } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GoalCard } from "@/components/GoalCard";

const Goals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    target_amount: "",
    deadline: ""
  });

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goal: typeof newGoal) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('goals')
        .insert([{
          user_id: user.id,
          name: goal.name,
          target_amount: parseFloat(goal.target_amount),
          deadline: goal.deadline || null
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: "Goal created successfully!" });
      setIsDialogOpen(false);
      setNewGoal({ name: "", target_amount: "", deadline: "" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create goal", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleCreateGoal = () => {
    if (!newGoal.name || !newGoal.target_amount) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createGoalMutation.mutate(newGoal);
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Savings Goals</h1>
            <p className="text-muted-foreground">Track your progress toward financial milestones</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set a savings target and track your progress
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal-name">Goal Name</Label>
                  <Input
                    id="goal-name"
                    placeholder="Emergency Fund"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="target-amount">Target Amount ($)</Label>
                  <Input
                    id="target-amount"
                    type="number"
                    placeholder="5000"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>
                
                <Button 
                  onClick={handleCreateGoal} 
                  className="w-full"
                  disabled={createGoalMutation.isPending}
                >
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading goals...</div>
        ) : goals && goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                title={goal.name}
                current={parseFloat(String(goal.current_amount))}
                target={parseFloat(String(goal.target_amount))}
                emoji={goal.icon}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Goals Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your savings journey by creating your first goal
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Goals;