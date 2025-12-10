import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { CreateChallengeInput } from "@/hooks/useSavingsChallenges";
import { addDays, format } from "date-fns";

interface CreateChallengeModalProps {
  onCreateChallenge: (input: CreateChallengeInput) => void;
  isCreating: boolean;
}

const challengeIcons = ['🎯', '💪', '🏆', '⭐', '🔥', '💰', '🎉', '🚀'];

export function CreateChallengeModal({ onCreateChallenge, isCreating }: CreateChallengeModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    challenge_name: '',
    challenge_type: 'save_amount' as const,
    target_amount: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    frequency: 'daily' as const,
    category: '',
    icon: '🎯',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onCreateChallenge({
      challenge_name: formData.challenge_name,
      challenge_type: formData.challenge_type,
      target_amount: formData.target_amount ? parseFloat(formData.target_amount) : undefined,
      start_date: formData.start_date,
      end_date: formData.end_date,
      frequency: formData.frequency,
      category: formData.category || undefined,
      icon: formData.icon,
    });
    
    setOpen(false);
    setFormData({
      challenge_name: '',
      challenge_type: 'save_amount',
      target_amount: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      frequency: 'daily',
      category: '',
      icon: '🎯',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Challenge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Savings Challenge</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Challenge Name</Label>
            <Input
              id="name"
              placeholder="e.g., No Coffee November"
              value={formData.challenge_name}
              onChange={(e) => setFormData(prev => ({ ...prev, challenge_name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex gap-2 flex-wrap">
              {challengeIcons.map(icon => (
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
            <Label htmlFor="type">Challenge Type</Label>
            <Select
              value={formData.challenge_type}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, challenge_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="save_amount">Save Amount</SelectItem>
                <SelectItem value="no_spend">No Spend</SelectItem>
                <SelectItem value="reduce_category">Reduce Category</SelectItem>
                <SelectItem value="52_week">52 Week Challenge</SelectItem>
                <SelectItem value="round_up">Round Up Savings</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target">Target Amount ($)</Label>
            <Input
              id="target"
              type="number"
              min="0"
              step="0.01"
              placeholder="1000"
              value={formData.target_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start Date</Label>
              <Input
                id="start"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Date</Label>
              <Input
                id="end"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">Check-in Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(formData.challenge_type as string) === 'reduce_category' && (
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Dining Out"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Challenge'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
