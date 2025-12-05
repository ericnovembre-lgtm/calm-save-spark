import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Target, DollarSign, Loader2 } from 'lucide-react';

interface AddToGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddToGoalModal({ isOpen, onClose }: AddToGoalModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Fetch user's goals
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!user?.id,
  });

  // Contribution mutation
  const contributeMutation = useMutation({
    mutationFn: async () => {
      const goal = goals?.find(g => g.id === selectedGoalId);
      if (!goal) throw new Error('Goal not found');

      const contributionAmount = parseFloat(amount);
      if (isNaN(contributionAmount) || contributionAmount <= 0) {
        throw new Error('Invalid amount');
      }

      const newAmount = (goal.current_amount || 0) + contributionAmount;

      const { error } = await supabase
        .from('goals')
        .update({ 
          current_amount: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedGoalId);

      if (error) throw error;
      
      return { goal, contributionAmount, newAmount };
    },
    onSuccess: ({ goal, contributionAmount, newAmount }) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal-contributions'] });
      
      const progress = Math.round((newAmount / goal.target_amount) * 100);
      toast.success(`Added $${contributionAmount.toFixed(2)} to ${goal.name}`, {
        description: `Progress: ${progress}% complete`
      });
      
      handleClose();
    },
    onError: (error) => {
      toast.error('Failed to add contribution', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    },
  });

  const handleClose = () => {
    setSelectedGoalId('');
    setAmount('');
    setNote('');
    onClose();
  };

  const selectedGoal = goals?.find(g => g.id === selectedGoalId);
  const remaining = selectedGoal ? selectedGoal.target_amount - (selectedGoal.current_amount || 0) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Add to Goal
          </DialogTitle>
          <DialogDescription>
            Contribute towards one of your savings goals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Goal Selection */}
          <div className="space-y-2">
            <Label htmlFor="goal">Select Goal</Label>
            <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
              <SelectTrigger>
                <SelectValue placeholder={goalsLoading ? "Loading goals..." : "Choose a goal"} />
              </SelectTrigger>
              <SelectContent>
                {goals?.map(goal => (
                  <SelectItem key={goal.id} value={goal.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{goal.icon} {goal.name}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {Math.round((goal.current_amount / goal.target_amount) * 100)}%
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
              />
            </div>
            {selectedGoal && (
              <p className="text-xs text-muted-foreground">
                ${remaining.toFixed(2)} remaining to reach goal
              </p>
            )}
          </div>

          {/* Note (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="What's this contribution for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => contributeMutation.mutate()}
            disabled={!selectedGoalId || !amount || contributeMutation.isPending}
          >
            {contributeMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...</>
            ) : (
              'Add Contribution'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
