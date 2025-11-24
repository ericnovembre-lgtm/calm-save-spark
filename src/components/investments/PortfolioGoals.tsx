import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Target, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProgressRing } from '@/components/ProgressRing';
import CountUp from 'react-countup';

interface PortfolioGoalsProps {
  userId: string;
  totalPortfolioValue: number;
}

const GOAL_TYPES = [
  { value: 'retirement', label: 'Retirement Fund', icon: '🏖️', color: '#3b82f6' },
  { value: 'emergency_fund', label: 'Emergency Fund', icon: '🛡️', color: '#10b981' },
  { value: 'house', label: 'House Down Payment', icon: '🏠', color: '#f59e0b' },
  { value: 'education', label: 'Education Fund', icon: '🎓', color: '#8b5cf6' },
  { value: 'custom', label: 'Custom Goal', icon: '🎯', color: '#ec4899' },
];

export function PortfolioGoals({ userId, totalPortfolioValue }: PortfolioGoalsProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_name: '',
    goal_type: 'retirement',
    target_amount: '',
    deadline: '',
  });
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['portfolio_goals', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const { error } = await supabase
        .from('portfolio_goals')
        .insert({
          user_id: userId,
          goal_name: goalData.goal_name,
          goal_type: goalData.goal_type,
          target_amount: parseFloat(goalData.target_amount),
          current_amount: totalPortfolioValue,
          deadline: goalData.deadline || null,
          icon: GOAL_TYPES.find(t => t.value === goalData.goal_type)?.icon,
          color: GOAL_TYPES.find(t => t.value === goalData.goal_type)?.color,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio_goals'] });
      toast.success('Portfolio goal created successfully');
      setIsCreateModalOpen(false);
      setNewGoal({ goal_name: '', goal_type: 'retirement', target_amount: '', deadline: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('portfolio_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio_goals'] });
      toast.success('Goal deleted successfully');
    },
  });

  const handleCreate = () => {
    if (!newGoal.goal_name || !newGoal.target_amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate(newGoal);
  };

  if (isLoading) return null;

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Portfolio Goals
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!goals || goals.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No portfolio goals yet</p>
            <p className="text-xs mt-1">Set targets for retirement, emergency funds, and more</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal, idx) => {
              const progress = Math.min((totalPortfolioValue / parseFloat(String(goal.target_amount))) * 100, 100);
              const remainingAmount = Math.max(parseFloat(String(goal.target_amount)) - totalPortfolioValue, 0);
              const daysUntilDeadline = goal.deadline ? 
                Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 relative group"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteMutation.mutate(goal.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{goal.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{goal.goal_name}</h4>
                      <p className="text-xs text-slate-400 capitalize">{goal.goal_type.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center mb-3">
                    <ProgressRing 
                      progress={progress} 
                      size={100} 
                      strokeWidth={8}
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target:</span>
                      <span className="font-mono text-slate-200">
                        ${parseFloat(String(goal.target_amount)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current:</span>
                      <span className="font-mono text-green-400">
                        $<CountUp end={totalPortfolioValue} duration={1} separator="," preserveValue />
                      </span>
                    </div>
                    {remainingAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Remaining:</span>
                        <span className="font-mono text-amber-400">
                          ${remainingAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {daysUntilDeadline !== null && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Deadline passed'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Create Goal Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Portfolio Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal_type">Goal Type</Label>
              <Select
                value={newGoal.goal_type}
                onValueChange={(value) => setNewGoal(prev => ({ ...prev, goal_type: value }))}
              >
                <SelectTrigger id="goal_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal_name">Goal Name</Label>
              <Input
                id="goal_name"
                placeholder="e.g., Retire by 50"
                value={newGoal.goal_name}
                onChange={(e) => setNewGoal(prev => ({ ...prev, goal_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_amount">Target Amount ($)</Label>
              <Input
                id="target_amount"
                type="number"
                placeholder="e.g., 1000000"
                value={newGoal.target_amount}
                onChange={(e) => setNewGoal(prev => ({ ...prev, target_amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Target Date (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="text-muted-foreground">
                Your current portfolio value (${totalPortfolioValue.toLocaleString()}) will be used as the starting point.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}