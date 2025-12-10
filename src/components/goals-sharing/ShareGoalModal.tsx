import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSharedGoals } from '@/hooks/useSharedGoals';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Target, Mail, Eye, Edit, DollarSign } from 'lucide-react';

interface ShareGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareGoalModal({ open, onOpenChange }: ShareGoalModalProps) {
  const { session } = useAuth();
  const { shareGoal } = useSharedGoals();
  
  const [selectedGoal, setSelectedGoal] = useState('');
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'contribute' | 'edit'>('view');

  // Fetch user's goals
  const { data: goals } = useQuery({
    queryKey: ['my-goals', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data } = await supabase
        .from('goals')
        .select('id, name, target_amount, current_amount, icon')
        .eq('user_id', session.user.id)
        .eq('is_active', true);
      return data || [];
    },
    enabled: !!session?.user?.id && open,
  });

  const handleSubmit = () => {
    if (!selectedGoal || !email.trim()) return;

    shareGoal.mutate(
      {
        goalId: selectedGoal,
        email: email.trim(),
        permissionLevel: permission,
      },
      {
        onSuccess: () => {
          setSelectedGoal('');
          setEmail('');
          setPermission('view');
          onOpenChange(false);
        },
      }
    );
  };

  const permissionOptions = [
    { value: 'view', label: 'View Only', icon: Eye, description: 'Can see progress' },
    { value: 'contribute', label: 'Contribute', icon: DollarSign, description: 'Can add to goal' },
    { value: 'edit', label: 'Full Access', icon: Edit, description: 'Can edit goal' },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Share a Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Goal</label>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a goal to share" />
              </SelectTrigger>
              <SelectContent>
                {goals?.map(goal => (
                  <SelectItem key={goal.id} value={goal.id}>
                    <div className="flex items-center gap-2">
                      <span>{goal.icon || '🎯'}</span>
                      <span>{goal.name}</span>
                      <span className="text-muted-foreground text-xs">
                        ${goal.current_amount} / ${goal.target_amount}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Recipient Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Permission Level</label>
            <div className="grid grid-cols-3 gap-2">
              {permissionOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setPermission(option.value)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      permission === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedGoal || !email.trim() || shareGoal.isPending}
          >
            {shareGoal.isPending ? 'Sharing...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
