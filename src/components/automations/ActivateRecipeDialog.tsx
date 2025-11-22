import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AutomationTemplate } from "@/hooks/useTemplates";
import { useAutomations } from "@/hooks/useAutomations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ActivateRecipeDialogProps {
  template: AutomationTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivateRecipeDialog({ template, open, onOpenChange }: ActivateRecipeDialogProps) {
  const [targetId, setTargetId] = useState<string>("");
  const { create, isCreating } = useAutomations();
  
  // Fetch goals
  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
  });

  const handleActivate = async () => {
    if (!targetId && template.action_config.type !== 'round_up') {
      toast.error("Please select a destination");
      return;
    }

    const targetGoal = goals?.find(g => g.id === targetId);

    try {
      await create({
        rule_name: template.name,
        rule_type: template.trigger_config.type === 'balance_threshold' ? 'balance_threshold' : 
                   template.trigger_config.type === 'date_based' ? 'scheduled_transfer' : 'transaction_match',
        trigger_condition: template.trigger_config,
        action_config: {
          ...template.action_config,
          target_id: targetId,
          target_name: targetGoal?.name
        },
        notes: template.description
      });
      toast.success(`${template.name} activated!`);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to activate recipe:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activate {template.name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {template.action_config.type !== 'round_up' && (
            <div className="space-y-2">
              <Label>Destination</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal or pot" />
                </SelectTrigger>
                <SelectContent>
                  {goals?.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleActivate} disabled={isCreating}>
            {isCreating ? "Activating..." : "Activate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
