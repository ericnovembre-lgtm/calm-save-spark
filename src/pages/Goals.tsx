import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Target, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GoalCard } from "@/components/GoalCard";
import { GoalSavingsOptimizer } from "@/components/goals/GoalSavingsOptimizer";
import { AIGoalSuggestions } from "@/components/goals/AIGoalSuggestions";
import { QuickGoalTemplates } from "@/components/goals/QuickGoalTemplates";
import { GoalCard3D } from "@/components/goals/advanced/GoalCard3D";
import { DynamicBackground } from "@/components/goals/ambient/DynamicBackground";
import { FloatingParticles } from "@/components/goals/ambient/FloatingParticles";
import { QuickActionMenu } from "@/components/goals/interactions/QuickActionMenu";
import { AnimatedLoadingState } from "@/components/goals/advanced/AnimatedLoadingState";
import { ContributeDialog } from "@/components/goals/ContributeDialog";
import { EditGoalDialog } from "@/components/goals/EditGoalDialog";
import { goalSchema, GoalFormData } from "@/lib/validations/goal-schemas";

const Goals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    target_amount: "",
    deadline: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: "Goal deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to delete goal", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GoalFormData> }) => {
      const { error } = await supabase
        .from('goals')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: "Goal updated successfully!" });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Failed to update goal", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleCreateGoal = () => {
    const result = goalSchema.safeParse({
      name: newGoal.name,
      target_amount: parseFloat(newGoal.target_amount),
      deadline: newGoal.deadline || undefined
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setFormErrors(fieldErrors);
      toast({ 
        title: "Please fix the errors below", 
        variant: "destructive" 
      });
      return;
    }

    setFormErrors({});
    createGoalMutation.mutate(newGoal);
  };

  return (
    <AppLayout>
      <DynamicBackground />
      <FloatingParticles count={30} />
      <div className="container mx-auto p-6 space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Savings Goals</h1>
            <p className="text-muted-foreground">Achieve your goals faster with AI-powered optimization</p>
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
                  <Label htmlFor="goal-name">Goal Name *</Label>
                  <Input
                    id="goal-name"
                    placeholder="Emergency Fund"
                    value={newGoal.name}
                    onChange={(e) => {
                      setNewGoal({ ...newGoal, name: e.target.value });
                      setFormErrors({ ...formErrors, name: "" });
                    }}
                    className={formErrors.name ? "border-destructive" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="target-amount">Target Amount ($) *</Label>
                  <Input
                    id="target-amount"
                    type="number"
                    placeholder="5000"
                    value={newGoal.target_amount}
                    onChange={(e) => {
                      setNewGoal({ ...newGoal, target_amount: e.target.value });
                      setFormErrors({ ...formErrors, target_amount: "" });
                    }}
                    className={formErrors.target_amount ? "border-destructive" : ""}
                  />
                  {formErrors.target_amount && (
                    <p className="text-sm text-destructive mt-1">{formErrors.target_amount}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => {
                      setNewGoal({ ...newGoal, deadline: e.target.value });
                      setFormErrors({ ...formErrors, deadline: "" });
                    }}
                    className={formErrors.deadline ? "border-destructive" : ""}
                  />
                  {formErrors.deadline && (
                    <p className="text-sm text-destructive mt-1">{formErrors.deadline}</p>
                  )}
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
          <AnimatedLoadingState />
        ) : goals && goals.length > 0 ? (
          <>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="ai-insights" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-semibold">AI Insights & Recommendations</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  <GoalSavingsOptimizer />
                  <AIGoalSuggestions />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <GoalCard3D
                  key={goal.id}
                  id={goal.id}
                  name={goal.name}
                  current={parseFloat(String(goal.current_amount))}
                  target={parseFloat(String(goal.target_amount))}
                  icon={goal.icon || undefined}
                  deadline={goal.deadline || undefined}
                  onContribute={() => {
                    setSelectedGoal(goal);
                    setContributeDialogOpen(true);
                  }}
                  onEdit={() => {
                    setSelectedGoal(goal);
                    setEditDialogOpen(true);
                  }}
                  onDelete={() => deleteGoalMutation.mutate(goal.id)}
                  onTogglePause={() => toast({ title: "Pause/Resume coming soon!" })}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <QuickGoalTemplates />
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Goals Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your savings journey by creating your first goal or use a template above
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        <QuickActionMenu
          onNewGoal={() => setIsDialogOpen(true)}
          onQuickDeposit={() => toast({ title: "Quick deposit coming soon!" })}
        />

        <ContributeDialog
          open={contributeDialogOpen}
          onOpenChange={setContributeDialogOpen}
          goalId={selectedGoal?.id || ""}
          goalName={selectedGoal?.name || ""}
          currentAmount={parseFloat(String(selectedGoal?.current_amount || 0))}
          targetAmount={parseFloat(String(selectedGoal?.target_amount || 0))}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['goals'] })}
        />

        <EditGoalDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          goal={selectedGoal}
          onSubmit={(id, data) => updateGoalMutation.mutate({ id, data })}
          isSubmitting={updateGoalMutation.isPending}
        />
      </div>
    </AppLayout>
  );
};

export default Goals;