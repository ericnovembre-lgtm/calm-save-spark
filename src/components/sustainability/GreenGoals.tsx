import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Target, Leaf } from "lucide-react";

export function GreenGoals() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    goal_name: "",
    goal_type: "carbon_reduction",
    target_amount: "",
    target_date: "",
  });

  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['sustainable-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sustainable_goals')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createGoal = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('sustainable_goals')
        .insert({
          goal_name: data.goal_name,
          goal_type: data.goal_type,
          target_amount: parseFloat(data.target_amount),
          target_date: data.target_date || null,
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sustainable-goals'] });
      toast.success("Green goal created successfully");
      setOpen(false);
      setFormData({
        goal_name: "",
        goal_type: "carbon_reduction",
        target_amount: "",
        target_date: "",
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to create goal: ${error.message}`);
    },
  });

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'carbon_reduction': return 'Carbon Reduction';
      case 'esg_investment': return 'ESG Investment';
      case 'green_spending': return 'Green Spending';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Green Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Green Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              createGoal.mutate(formData);
            }} className="space-y-4">
              <div>
                <Label htmlFor="goal_name">Goal Name *</Label>
                <Input
                  id="goal_name"
                  value={formData.goal_name}
                  onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                  placeholder="Reduce carbon footprint"
                  required
                />
              </div>

              <div>
                <Label htmlFor="goal_type">Goal Type *</Label>
                <Select value={formData.goal_type} onValueChange={(value) => setFormData({ ...formData, goal_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carbon_reduction">Carbon Reduction (kg)</SelectItem>
                    <SelectItem value="esg_investment">ESG Investment ($)</SelectItem>
                    <SelectItem value="green_spending">Green Spending ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target_amount">Target Amount *</Label>
                <Input
                  id="target_amount"
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="target_date">Target Date</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                />
              </div>

              <Button type="submit" disabled={createGoal.isPending}>
                {createGoal.isPending ? "Creating..." : "Create Goal"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">Loading goals...</p>
          </Card>
        ) : goals?.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No green goals yet. Create your first goal to track your sustainability progress!
            </p>
          </Card>
        ) : (
          goals?.map((goal) => {
            const progress = (parseFloat(goal.current_amount.toString()) / parseFloat(goal.target_amount.toString())) * 100;
            return (
              <Card key={goal.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-orbital bg-green-100 dark:bg-green-900">
                      <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{goal.goal_name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {getGoalTypeLabel(goal.goal_type)}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant={progress >= 100 ? "default" : "outline"}>
                    {progress >= 100 ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {parseFloat(goal.current_amount.toString()).toFixed(2)} / {parseFloat(goal.target_amount.toString()).toFixed(2)}
                      {goal.goal_type === 'carbon_reduction' ? ' kg' : ' $'}
                    </span>
                  </div>
                  <Progress value={Math.min(progress, 100)} />
                  <p className="text-xs text-muted-foreground">
                    {progress.toFixed(1)}% complete
                  </p>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
