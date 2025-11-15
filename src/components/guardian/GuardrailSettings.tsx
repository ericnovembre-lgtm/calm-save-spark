import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

export function GuardrailSettings() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: guardrails, isLoading } = useQuery({
    queryKey: ['guardrails'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('behavioral_guardrails')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
  });

  const [settings, setSettings] = useState({
    cooling_off_enabled: true,
    cooling_off_duration: 15,
    max_trade_size: 1000,
    require_counter_arguments: true,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete existing guardrails
      await supabase
        .from('behavioral_guardrails')
        .delete()
        .eq('user_id', user.id);

      // Insert new guardrails
      const guardrailsToInsert = [];

      if (settings.cooling_off_enabled) {
        guardrailsToInsert.push({
          user_id: user.id,
          rule_type: 'cooling_off',
          parameters: { duration_minutes: settings.cooling_off_duration },
          is_active: true,
        });
      }

      if (settings.max_trade_size > 0) {
        guardrailsToInsert.push({
          user_id: user.id,
          rule_type: 'max_trade_size',
          parameters: { max_amount: settings.max_trade_size },
          is_active: true,
        });
      }

      if (settings.require_counter_arguments) {
        guardrailsToInsert.push({
          user_id: user.id,
          rule_type: 'require_review',
          parameters: { threshold_confidence: 0.6 },
          is_active: true,
        });
      }

      if (guardrailsToInsert.length > 0) {
        const { error } = await supabase
          .from('behavioral_guardrails')
          .insert(guardrailsToInsert);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Guardrail settings saved');
      queryClient.invalidateQueries({ queryKey: ['guardrails'] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error('Failed to save settings');
      console.error(error);
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Guardrail Settings</h3>
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Guardrail Settings</h3>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit Settings
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="cooling-off">Cooling-Off Periods</Label>
            <p className="text-sm text-muted-foreground">
              Enforce mandatory reflection time for emotional trades
            </p>
          </div>
          <Switch
            id="cooling-off"
            checked={settings.cooling_off_enabled}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, cooling_off_enabled: checked })
            }
            disabled={!isEditing}
          />
        </div>

        {settings.cooling_off_enabled && (
          <div className="space-y-2 pl-6">
            <Label htmlFor="duration">Cooling-Off Duration</Label>
            <Select
              value={settings.cooling_off_duration.toString()}
              onValueChange={(value) =>
                setSettings({ ...settings, cooling_off_duration: parseInt(value) })
              }
              disabled={!isEditing}
            >
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="1440">24 hours</SelectItem>
                <SelectItem value="2880">48 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="max-trade">Maximum Single Trade Amount</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">$</span>
            <Input
              id="max-trade"
              type="number"
              value={settings.max_trade_size}
              onChange={(e) =>
                setSettings({ ...settings, max_trade_size: parseFloat(e.target.value) })
              }
              disabled={!isEditing}
              className="max-w-xs"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Trades exceeding this amount will trigger additional review
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="counter-args">Require Counter-Argument Review</Label>
            <p className="text-sm text-muted-foreground">
              Show data-driven counterpoints before emotional trades
            </p>
          </div>
          <Switch
            id="counter-args"
            checked={settings.require_counter_arguments}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, require_counter_arguments: checked })
            }
            disabled={!isEditing}
          />
        </div>

        {isEditing && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              💡 Tip: More restrictive settings help protect against impulsive decisions, but may
              slow down your trading workflow. Find a balance that works for you.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
