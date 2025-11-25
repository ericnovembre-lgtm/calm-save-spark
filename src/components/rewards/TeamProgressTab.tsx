import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, TrendingUp, Target } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function TeamProgressTab() {
  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  const { data: goals, isLoading } = useQuery({
    queryKey: ['collaborative-goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('collaborative_goals')
        .select(`
          *,
          collaborative_goal_members (
            user_id,
            contribution
          )
        `)
        .or(`created_by.eq.${user.id},id.in.(${
          // Get goal IDs where user is a member
          'SELECT goal_id FROM collaborative_goal_members WHERE user_id=' + user.id
        })`);
      
      if (error) throw error;
      return data;
    },
  });

  const createGoal = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('collaborative_goals')
        .insert({
          name: goalName,
          target_amount: parseFloat(targetAmount),
          goal_type: 'savings',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as member
      await supabase
        .from('collaborative_goal_members')
        .insert({
          goal_id: data.id,
          user_id: user.id,
          contribution: 0,
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-goals'] });
      toast.success('Collaborative goal created!');
      setShowCreateForm(false);
      setGoalName("");
      setTargetAmount("");
    },
    onError: (error) => {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    },
  });

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Team Progress</h2>
            <p className="text-sm text-muted-foreground">
              Collaborate with partners, family, or friends on shared financial goals
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      {showCreateForm && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Create Collaborative Goal</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Goal Name
                </label>
                <Input
                  placeholder="e.g., Household Budget Challenge"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Target Amount
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => createGoal.mutate()}
                  disabled={!goalName || !targetAmount || createGoal.isPending}
                  className="gap-2"
                >
                  <Target className="w-4 h-4" />
                  Create Goal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {!goals || goals.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            No collaborative goals yet. Create one to start working together!
          </p>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal, index) => {
            const progressPercent = goal.target_amount 
              ? (Number(goal.current_amount) / Number(goal.target_amount)) * 100 
              : 0;
            const memberCount = goal.collaborative_goal_members?.length || 0;
            const members = goal.collaborative_goal_members || [];
            
            // Calculate contribution percentages for tug-of-war
            const totalContributions = members.reduce((sum, m) => sum + Number(m.contribution || 0), 0);
            const leftContribution = totalContributions > 0 
              ? (Number(members[0]?.contribution || 0) / totalContributions) * 100 
              : 50;
            const rightContribution = 100 - leftContribution;

            return (
              <motion.div
                key={goal.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{goal.name}</h3>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {goal.description}
                          </p>
                        )}
                      </div>
                      {goal.is_completed && (
                        <div className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                          ✓ Complete
                        </div>
                      )}
                    </div>

                    {/* Tug-of-War Visualization */}
                    {memberCount >= 2 && (
                      <div className="space-y-3">
                        <div className="relative h-12 flex items-center">
                          {/* Left Avatar */}
                          <motion.div
                            className="absolute left-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary border-2 border-primary z-10"
                            style={{ left: `${leftContribution * 0.8}%` }}
                            transition={{ type: "spring", damping: 15 }}
                          >
                            ME
                          </motion.div>

                          {/* Rope/Progress Bar */}
                          <div className="absolute inset-x-0 h-3 bg-muted/50 rounded-full overflow-hidden">
                            <div className="absolute inset-0 flex">
                              <motion.div
                                className="bg-gradient-to-r from-primary to-primary/50"
                                style={{ width: `${leftContribution}%` }}
                                transition={{ type: "spring", damping: 20 }}
                              />
                              <motion.div
                                className="bg-gradient-to-l from-accent to-accent/50"
                                style={{ width: `${rightContribution}%` }}
                                transition={{ type: "spring", damping: 20 }}
                              />
                            </div>
                            {/* Central goal marker */}
                            <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-0.5 h-5 bg-foreground/30" />
                          </div>

                          {/* Right Avatar */}
                          <motion.div
                            className="absolute right-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent border-2 border-accent z-10"
                            style={{ right: `${rightContribution * 0.8}%` }}
                            transition={{ type: "spring", damping: 15 }}
                          >
                            {members[1]?.user_id?.substring(0, 2).toUpperCase() || 'P2'}
                          </motion.div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>${Number(members[0]?.contribution || 0).toFixed(2)}</span>
                          <span className="font-semibold text-foreground">🎯 ${Number(goal.target_amount).toFixed(2)}</span>
                          <span>${Number(members[1]?.contribution || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Standard progress for single member */}
                    {memberCount < 2 && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-foreground">
                              ${Number(goal.current_amount).toFixed(2)} / ${Number(goal.target_amount).toFixed(2)}
                            </span>
                          </div>
                          <AnimatedProgress value={Math.min(progressPercent, 100)} />
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2 text-sm text-primary">
                      <TrendingUp className="w-4 h-4" />
                      <span>{progressPercent.toFixed(0)}% toward target</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
