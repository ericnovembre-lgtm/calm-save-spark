import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit } from "lucide-react";
import { useState } from "react";

interface CostBreakdownProps {
  lifePlanId: string;
}

export function CostBreakdown({ lifePlanId }: CostBreakdownProps) {
  const [newCost, setNewCost] = useState({ category: "", amount: "" });
  const queryClient = useQueryClient();

  const { data: costs } = useQuery({
    queryKey: ["life-event-costs", lifePlanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("life_event_costs")
        .select("*")
        .eq("life_plan_id", lifePlanId)
        .order("category");

      if (error) throw error;
      return data;
    }
  });

  const addCost = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("life_event_costs")
        .insert({
          life_plan_id: lifePlanId,
          cost_name: newCost.category,
          cost_category: newCost.category,
          cost_type: "one_time",
          estimated_amount: parseFloat(newCost.amount)
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["life-event-costs", lifePlanId] });
      setNewCost({ category: "", amount: "" });
    }
  });

  const togglePaid = useMutation({
    mutationFn: async ({ id, isPaid }: { id: string; isPaid: boolean }) => {
      const { error } = await supabase
        .from("life_event_costs")
        .update({ 
          is_paid: !isPaid,
          payment_date: !isPaid ? new Date().toISOString() : null
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["life-event-costs", lifePlanId] });
    }
  });

  const totalCost = costs?.reduce((sum, c) => sum + c.estimated_amount, 0) || 0;
  const paidCost = costs?.filter(c => c.is_paid).reduce((sum, c) => sum + c.estimated_amount, 0) || 0;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Cost Breakdown</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Budget</span>
            <span className="text-2xl font-bold text-foreground">
              ${totalCost.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${(paidCost / totalCost) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Paid: ${paidCost.toLocaleString()}</span>
            <span>Remaining: ${(totalCost - paidCost).toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          {costs?.map(cost => (
            <div key={cost.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={cost.is_paid}
                  onCheckedChange={() => togglePaid.mutate({ id: cost.id, isPaid: cost.is_paid })}
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${cost.is_paid ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {cost.cost_name}
                  </p>
                  {cost.notes && (
                    <p className="text-xs text-muted-foreground">{cost.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  ${cost.estimated_amount.toLocaleString()}
                </span>
                <Button size="sm" variant="ghost">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4 border-t border-border">
          <Input
            placeholder="Category (e.g., Venue)"
            value={newCost.category}
            onChange={(e) => setNewCost({ ...newCost, category: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={newCost.amount}
            onChange={(e) => setNewCost({ ...newCost, amount: e.target.value })}
            className="w-32"
          />
          <Button onClick={() => addCost.mutate()} disabled={!newCost.category || !newCost.amount}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
