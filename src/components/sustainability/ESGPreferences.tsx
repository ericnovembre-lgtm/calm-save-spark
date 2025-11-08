import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Leaf, Users, Shield } from "lucide-react";

export function ESGPreferences() {
  const [formData, setFormData] = useState({
    environmental_weight: 33,
    social_weight: 33,
    governance_weight: 34,
  });

  const queryClient = useQueryClient();

  const { data: preferences } = useQuery({
    queryKey: ['esg-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('esg_preferences')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        environmental_weight: preferences.environmental_weight || 33,
        social_weight: preferences.social_weight || 33,
        governance_weight: preferences.governance_weight || 34,
      });
    }
  }, [preferences]);

  const savePreferences = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('esg_preferences')
        .upsert(data as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['esg-preferences'] });
      toast.success("ESG preferences updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update preferences: ${error.message}`);
    },
  });

  const handleWeightChange = (key: string, value: number[]) => {
    const newValue = value[0];
    const oldValue = formData[key as keyof typeof formData];
    const diff = newValue - oldValue;

    // Redistribute the difference among other weights
    const otherKeys = Object.keys(formData).filter(k => k !== key) as Array<keyof typeof formData>;
    const adjustmentPerKey = -diff / otherKeys.length;

    const newData = { ...formData, [key]: newValue };
    otherKeys.forEach(k => {
      newData[k] = Math.max(0, Math.min(100, formData[k] + adjustmentPerKey));
    });

    setFormData(newData);
  };

  const total = formData.environmental_weight + formData.social_weight + formData.governance_weight;

  return (
    <Card className="p-6 max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">ESG Investment Preferences</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Set your priorities for Environmental, Social, and Governance factors in investment recommendations.
      </p>

      <form onSubmit={(e) => {
        e.preventDefault();
        savePreferences.mutate(formData);
      }} className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="w-5 h-5 text-green-600" />
            <Label>Environmental ({formData.environmental_weight}%)</Label>
          </div>
          <Slider
            value={[formData.environmental_weight]}
            onValueChange={(v) => handleWeightChange('environmental_weight', v)}
            max={100}
            step={1}
            className="mb-2"
          />
          <p className="text-xs text-muted-foreground">
            Climate change, pollution, renewable energy, resource management
          </p>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <Label>Social ({formData.social_weight}%)</Label>
          </div>
          <Slider
            value={[formData.social_weight]}
            onValueChange={(v) => handleWeightChange('social_weight', v)}
            max={100}
            step={1}
            className="mb-2"
          />
          <p className="text-xs text-muted-foreground">
            Labor practices, diversity, human rights, community relations
          </p>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-purple-600" />
            <Label>Governance ({formData.governance_weight}%)</Label>
          </div>
          <Slider
            value={[formData.governance_weight]}
            onValueChange={(v) => handleWeightChange('governance_weight', v)}
            max={100}
            step={1}
            className="mb-2"
          />
          <p className="text-xs text-muted-foreground">
            Board structure, executive compensation, business ethics, transparency
          </p>
        </div>

        <div className="p-4 bg-secondary rounded-lg">
          <p className="text-sm font-semibold">Total: {total.toFixed(0)}%</p>
          {Math.abs(total - 100) > 0.5 && (
            <p className="text-xs text-yellow-600 mt-1">
              Weights should total 100%. Adjust sliders to balance.
            </p>
          )}
        </div>

        <Button type="submit" disabled={savePreferences.isPending || Math.abs(total - 100) > 0.5}>
          {savePreferences.isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </form>
    </Card>
  );
}
