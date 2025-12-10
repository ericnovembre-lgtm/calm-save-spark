import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { addMonths, format } from "date-fns";

interface CreateSharedGoalModalProps {
  onCreateGoal: (input: { goal_name: string; target_amount: number; target_date?: string; icon?: string }) => void;
  isCreating: boolean;
}

const goalIcons = ['🏠', '✈️', '💍', '🚗', '👶', '🎓', '💒', '🏝️', '🎉', '💰'];

export function CreateSharedGoalModal({ onCreateGoal, isCreating }: CreateSharedGoalModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    target_date: format(addMonths(new Date(), 12), 'yyyy-MM-dd'),
    icon: '🎯',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onCreateGoal({
      goal_name: formData.goal_name,
      target_amount: parseFloat(formData.target_amount),
      target_date: formData.target_date || undefined,
      icon: formData.icon,
    });
    
    setOpen(false);
    setFormData({
      goal_name: '',
      target_amount: '',
      target_date: format(addMonths(new Date(), 12), 'yyyy-MM-dd'),
      icon: '🎯',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Shared Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Shared Goal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              placeholder="e.g., Dream Vacation"
              value={formData.goal_name}
              onChange={(e) => setFormData(prev => ({ ...prev, goal_name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex gap-2 flex-wrap">
              {goalIcons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`text-2xl p-2 rounded-lg transition-colors ${
                    formData.icon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Target Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="10000"
              value={formData.target_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Target Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Shared Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
