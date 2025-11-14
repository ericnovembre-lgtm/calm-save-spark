import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";

interface RoundUpToggleProps {
  goalId: string;
  existingRule?: {
    id: string;
    active: boolean;
    multiplier: number;
    total_saved: number;
  };
}

export const RoundUpToggle = ({ goalId, existingRule }: RoundUpToggleProps) => {
  const [enabled, setEnabled] = useState(existingRule?.active || false);
  const [multiplier, setMultiplier] = useState(existingRule?.multiplier || 1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleToggle = async (checked: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (existingRule) {
        // Update existing rule
        const { error } = await supabase
          .from('round_up_rules')
          .update({ active: checked })
          .eq('id', existingRule.id);
        
        if (error) throw error;
      } else if (checked) {
        // Create new rule
        const { error } = await supabase
          .from('round_up_rules')
          .insert({
            user_id: user.id,
            goal_id: goalId,
            multiplier,
            active: true
          });
        
        if (error) throw error;
      }

      setEnabled(checked);
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      
      toast({
        title: checked ? "Round-Ups Enabled! 🎯" : "Round-Ups Disabled",
        description: checked 
          ? `Every purchase will be rounded up ${multiplier}x toward this goal`
          : "Round-ups have been turned off for this goal",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMultiplierChange = async (value: number[]) => {
    const newMultiplier = value[0];
    setMultiplier(newMultiplier);

    if (existingRule) {
      try {
        const { error } = await supabase
          .from('round_up_rules')
          .update({ multiplier: newMultiplier })
          .eq('id', existingRule.id);
        
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      } catch (error: any) {
        console.error('Error updating multiplier:', error);
      }
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-lg bg-accent/50 border border-border">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor={`round-up-${goalId}`} className="text-sm font-medium">
            Round-Up Savings
          </Label>
          <p className="text-xs text-muted-foreground">
            Automatically save change from every purchase
          </p>
        </div>
        <Switch
          id={`round-up-${goalId}`}
          checked={enabled}
          onCheckedChange={handleToggle}
        />
      </div>

      {enabled && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Multiplier</Label>
              <Badge variant="secondary">{multiplier}x</Badge>
            </div>
            <Slider
              value={[multiplier]}
              onValueChange={handleMultiplierChange}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Example: $4.30 purchase → ${(Math.ceil(4.30) - 4.30) * multiplier} saved
            </p>
          </div>

          {existingRule && existingRule.total_saved > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                ${existingRule.total_saved.toFixed(2)} saved through round-ups
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};